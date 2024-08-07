// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MinkRewards is Ownable, ReentrancyGuard {
    IERC20 public immutable minkToken;

    // State variables
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed; // Track total rewards distributed

    mapping(address => uint256) private stakes;
    mapping(address => uint256) private rewards;
    mapping(address => uint256) private lastUpdate;
    mapping(address => uint256) private lockEndTimes;
    mapping(address => uint256) private stakingTimestamps;

    // History mappings
    mapping(address => uint256[]) private stakingHistory;
    mapping(address => uint256[]) private rewardHistory;

    // Penalty parameters
    uint256 public penaltyPercentage = 100; // Reward percentage to lose on early unstaking

    // Stake limits
    uint256 public minStakeAmount90Days = 1000e18;
    uint256 public minStakeAmount180Days = 10000e18;
    uint256 public minStakeAmount365Days = 1000000e18;

    uint256 public lockPeriod90Days = 90 days;
    uint256 public lockPeriod180Days = 180 days;
    uint256 public lockPeriod365Days = 365 days;

    // Reward rate and constants
    uint256 public rewardRate = 1000;
    uint256 private constant REWARD_SCALE = 1e18;

    // Event declarations
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event MinimumStakeAmountsUpdated(uint256 min90Days, uint256 min180Days, uint256 min365Days);
    event PenaltyPercentageUpdated(uint256 newPenaltyPercentage);

    // Constructor requires initialOwner for Ownable
    constructor(address _minkToken, address initialOwner) Ownable(initialOwner) ReentrancyGuard() {
        require(_minkToken != address(0), "Token address cannot be zero");
        minkToken = IERC20(_minkToken);
    }

    function stake(uint256 _amount, uint256 _lockPeriod) external nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");

        uint256 minStakeAmount;
        if (_lockPeriod == lockPeriod90Days) {
            minStakeAmount = minStakeAmount90Days;
        } else if (_lockPeriod == lockPeriod180Days) {
            minStakeAmount = minStakeAmount180Days;
        } else if (_lockPeriod == lockPeriod365Days) {
            minStakeAmount = minStakeAmount365Days;
        } else {
            revert("Invalid lock period");
        }

        require(_amount >= minStakeAmount, "Amount is below minimum stake for the selected lock period");

        updateReward(msg.sender);

        bool success = minkToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");

        totalStaked += _amount;
        stakes[msg.sender] += _amount;
        stakingTimestamps[msg.sender] = block.timestamp;
        lockEndTimes[msg.sender] = block.timestamp + _lockPeriod;

        // Record staking history
        stakingHistory[msg.sender].push(block.timestamp);

        emit Staked(msg.sender, _amount, _lockPeriod);
    }

    function unstake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");
        require(stakes[msg.sender] >= _amount, "Insufficient staked balance");

        uint256 lockEndTime = lockEndTimes[msg.sender];
        require(block.timestamp >= lockEndTime, "Tokens are still locked");

        updateReward(msg.sender);

        // Handle rewards penalty for early unstaking
        if (_amount == stakes[msg.sender]) {
            rewards[msg.sender] = 0; // Lose all rewards if unstaking all staked tokens
        }

        totalStaked -= _amount;
        stakes[msg.sender] -= _amount;

        bool success = minkToken.transfer(msg.sender, _amount);
        require(success, "Token transfer failed");

        emit Unstaked(msg.sender, _amount);
    }

    function claimReward() external nonReentrant {
        updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");

        rewards[msg.sender] = 0;

        bool success = minkToken.transfer(msg.sender, reward);
        require(success, "Reward transfer failed");

        totalRewardsDistributed += reward; // Update total rewards distributed

        // Record reward history
        rewardHistory[msg.sender].push(reward);

        emit RewardPaid(msg.sender, reward);
    }

    function updateReward(address _user) internal {
        uint256 timeElapsed = block.timestamp - lastUpdate[_user];
        if (stakes[_user] > 0 && timeElapsed > 0) {
            rewards[_user] += (stakes[_user] * rewardRate * timeElapsed) / REWARD_SCALE;
        }
        lastUpdate[_user] = block.timestamp;
    }

    function getStakingDuration(address _user) external view returns (uint256) {
        if (stakes[_user] > 0) {
            return block.timestamp - stakingTimestamps[_user];
        } else {
            return 0;
        }
    }

    function getLockEndTime(address _user) external view returns (uint256) {
        return lockEndTimes[_user];
    }

    function getStakingHistory(address _user) external view returns (uint256[] memory) {
        return stakingHistory[_user];
    }

    function getRewardHistory(address _user) external view returns (uint256[] memory) {
        return rewardHistory[_user];
    }

    function updateRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }

    function updateMinimumStakeAmounts(
        uint256 _min90Days,
        uint256 _min180Days,
        uint256 _min365Days
    ) external onlyOwner {
        minStakeAmount90Days = _min90Days;
        minStakeAmount180Days = _min180Days;
        minStakeAmount365Days = _min365Days;

        emit MinimumStakeAmountsUpdated(_min90Days, _min180Days, _min365Days);
    }

    function updatePenaltyPercentage(uint256 _newPenaltyPercentage) external onlyOwner {
        penaltyPercentage = _newPenaltyPercentage;
        emit PenaltyPercentageUpdated(_newPenaltyPercentage);
    }

    function getStakedBalance(address _user) external view returns (uint256) {
        return stakes[_user];
    }

    function getRewardBalance(address _user) external view returns (uint256) {
        return calculateReward(_user);
    }

    function calculateReward(address _user) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdate[_user];
        return (stakes[_user] * rewardRate * timeElapsed) / REWARD_SCALE + rewards[_user];
    }

    function calculateAPY() public view returns (uint256) {
        uint256 dailyRewardRate = rewardRate * 86400 / REWARD_SCALE;
        uint256 apy = (dailyRewardRate + 1) ** 365 - 1;
        return apy;
    }

    function getTotalRewardsDistributed() external view returns (uint256) {
        return totalRewardsDistributed;
    }
}