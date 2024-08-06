// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MinkRewards is Ownable, ReentrancyGuard {
    IERC20 public immutable minkToken;

    mapping(address => uint256) private stakes;
    mapping(address => uint256) private rewards;

    uint256 public rewardRate = 1000; // Example rate, can be set via a function
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _minkToken) Ownable(0x0A8b1fa29A3f65BB739cd332c3DF09887ecD99CF) {
        require(_minkToken != address(0), "Token address cannot be zero");
        minkToken = IERC20(_minkToken);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");

        bool success = minkToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");

        totalStaked += _amount;
        stakes[msg.sender] += _amount;

        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");
        require(stakes[msg.sender] >= _amount, "Insufficient staked balance");

        totalStaked -= _amount;
        stakes[msg.sender] -= _amount;

        bool success = minkToken.transfer(msg.sender, _amount);
        require(success, "Token transfer failed");

        emit Unstaked(msg.sender, _amount);
    }

    function claimReward() external nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards available");

        rewards[msg.sender] = 0;

        bool success = minkToken.transfer(msg.sender, reward);
        require(success, "Reward transfer failed");

        emit RewardPaid(msg.sender, reward);
    }

    function calculateReward(address _user) public view returns (uint256) {
        return (stakes[_user] * rewardRate) / 1e18;
    }

    function updateRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
    }

    function getStakedBalance(address _user) external view returns (uint256) {
        return stakes[_user];
    }

    function getRewardBalance(address _user) external view returns (uint256) {
        return rewards[_user];
    }
}
