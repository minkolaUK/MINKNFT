// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ETCDex is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public immutable token;
    uint256 public feePercentage = 3; // 0.3% fee (3/1000)
    uint256 private _totalLiquidity; // Tracks total liquidity for mint/burn
    uint256 public rewardRate = 1000; // Reward rate (scaled)

    uint256 private constant SECONDS_IN_A_YEAR = 31557600; // 365.25 days in seconds
    uint256 private constant REWARD_SCALE = 1e18;

    mapping(address => uint256) private _liquidityProviders; // Tracks liquidity provided
    mapping(address => uint256) private _rewards; // Tracks accumulated rewards
    mapping(address => uint256) private _lastUpdate; // Tracks last reward update time
    mapping(address => uint256) private _stakingTimestamps; // Tracks staking timestamps

    event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 etcAmount, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 etcAmount, uint256 liquidity);
    event SwapETCForTokens(address indexed user, uint256 etcAmount, uint256 tokenAmount);
    event SwapTokensForETC(address indexed user, uint256 tokenAmount, uint256 etcAmount);
    event RewardClaimed(address indexed provider, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(IERC20 _token, address payable initialOwner) Ownable(initialOwner) {
        require(address(_token) != address(0), "Token address cannot be zero");
        token = _token;
        transferOwnership(initialOwner);
    }

    modifier validReserves() {
        require(getETCReserve() > 0 && getTokenReserve() > 0, "Invalid reserves");
        _;
    }

    function getTokenReserve() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getETCReserve() public view returns (uint256) {
        return address(this).balance;
    }

    function addLiquidity(uint256 tokenAmount) external payable nonReentrant returns (uint256 liquidity) {
        uint256 etcReserve = getETCReserve();
        uint256 tokenReserve = getTokenReserve();

        if (tokenReserve == 0 || etcReserve == 0) {
            token.safeTransferFrom(msg.sender, address(this), tokenAmount);
            liquidity = msg.value;
            _totalLiquidity += liquidity;
        } else {
            uint256 etcAmount = msg.value;
            uint256 tokenAmountRequired = (etcAmount * tokenReserve) / etcReserve;
            require(tokenAmount >= tokenAmountRequired, "Insufficient token amount provided");

            token.safeTransferFrom(msg.sender, address(this), tokenAmountRequired);
            liquidity = (etcAmount * _totalLiquidity) / etcReserve;
            _totalLiquidity += liquidity;
        }

        _liquidityProviders[msg.sender] = _liquidityProviders[msg.sender].add(liquidity);
        _stakingTimestamps[msg.sender] = block.timestamp; // Update staking timestamp
        _updateReward(msg.sender);

        emit LiquidityAdded(msg.sender, tokenAmount, msg.value, liquidity);
    }

    function removeLiquidity(uint256 liquidity) external nonReentrant returns (uint256 etcAmount, uint256 tokenAmount) {
        require(liquidity > 0 && liquidity <= _liquidityProviders[msg.sender], "Invalid liquidity amount");

        uint256 etcReserve = getETCReserve();
        uint256 tokenReserve = getTokenReserve();

        etcAmount = (liquidity * etcReserve) / _totalLiquidity;
        tokenAmount = (liquidity * tokenReserve) / _totalLiquidity;

        _totalLiquidity -= liquidity;
        _liquidityProviders[msg.sender] = _liquidityProviders[msg.sender].sub(liquidity);

        _updateReward(msg.sender);

        payable(msg.sender).transfer(etcAmount);
        token.safeTransfer(msg.sender, tokenAmount);

        emit LiquidityRemoved(msg.sender, tokenAmount, etcAmount, liquidity);
    }

    function swapETCForTokens() external payable nonReentrant validReserves {
        uint256 tokenReserve = getTokenReserve();
        uint256 tokensBought = _getAmountOfTokens(msg.value, getETCReserve() - msg.value, tokenReserve);

        token.safeTransfer(msg.sender, tokensBought);
        emit SwapETCForTokens(msg.sender, msg.value, tokensBought);
    }

    function swapTokensForETC(uint256 tokenAmount) external nonReentrant validReserves {
        uint256 etcReserve = getETCReserve();
        uint256 etcBought = _getAmountOfTokens(tokenAmount, getTokenReserve(), etcReserve);

        token.safeTransferFrom(msg.sender, address(this), tokenAmount);
        payable(msg.sender).transfer(etcBought);

        emit SwapTokensForETC(msg.sender, tokenAmount, etcBought);
    }

    function claimReward() external nonReentrant {
        _updateReward(msg.sender);
        uint256 reward = _rewards[msg.sender];
        require(reward > 0, "No rewards available");

        _rewards[msg.sender] = 0;

        bool success = token.transfer(msg.sender, reward);
        require(success, "Reward transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    function _updateReward(address provider) internal {
        uint256 timeElapsed = block.timestamp.sub(_lastUpdate[provider]);
        if (_liquidityProviders[provider] > 0 && timeElapsed > 0) {
            uint256 newReward = _liquidityProviders[provider]
                .mul(rewardRate)
                .mul(timeElapsed)
                .div(SECONDS_IN_A_YEAR)
                .div(REWARD_SCALE);
            _rewards[provider] = _rewards[provider].add(newReward);
        }
        _lastUpdate[provider] = block.timestamp;
    }

    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }

    function _getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    )
        private
        view
        returns (uint256)
    {
        uint256 inputAmountWithFee = (inputAmount * (1000 - feePercentage)) / 1000;
        return (inputAmountWithFee * outputReserve) / (inputReserve * 1000 + inputAmountWithFee);
    }

    function _mint(address to, uint256 amount) private {
        // Internal logic for minting liquidity tokens
        // Placeholder implementation
    }

    function _burn(address from, uint256 amount) private {
        // Internal logic for burning liquidity tokens
        // Placeholder implementation
    }

    function totalSupply() public view returns (uint256) {
        return _totalLiquidity;
    }
}