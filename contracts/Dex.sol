// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    address public feeAddress;

    uint256 private constant SECONDS_IN_A_YEAR = 31557600; // 365.25 days in seconds
    uint256 private constant REWARD_SCALE = 1e18;

    mapping(address => uint256) private _liquidityProviders; // Tracks liquidity provided
    mapping(address => uint256) private _liquidityTokens; // Tracks liquidity token balance
    mapping(address => uint256) private _rewards; // Tracks accumulated rewards
    mapping(address => uint256) private _lastUpdate; // Tracks last reward update time
    mapping(address => uint256) private _stakingTimestamps; // Tracks staking timestamps
    mapping(address => LockedLiquidity) private _lockedLiquidity; // Tracks locked liquidity

    struct LockedLiquidity {
        uint256 amount;
        uint256 unlockTime;
    }

    struct HistoricalEvent {
        uint256 timestamp;
        string eventType;
        uint256 amount;
    }

    HistoricalEvent[] public history;

    event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 etcAmount, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 etcAmount, uint256 liquidity);
    event SwapETCForTokens(address indexed user, uint256 etcAmount, uint256 tokenAmount);
    event SwapTokensForETC(address indexed user, uint256 tokenAmount, uint256 etcAmount);
    event RewardClaimed(address indexed provider, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event FeeAddressUpdated(address indexed newFeeAddress);
    event LiquidityLocked(address indexed provider, uint256 amount, uint256 unlockTime);
    event LiquidityUnlocked(address indexed provider, uint256 amount);

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
        return _addLiquidity(tokenAmount, msg.value, msg.sender);
    }

    function _addLiquidity(uint256 tokenAmount, uint256 etcAmount, address provider) internal returns (uint256 liquidity) {
        uint256 etcReserve = getETCReserve();
        uint256 tokenReserve = getTokenReserve();

        if (tokenReserve == 0 || etcReserve == 0) {
            token.safeTransferFrom(provider, address(this), tokenAmount);
            liquidity = etcAmount;
            _totalLiquidity += liquidity;
        } else {
            uint256 tokenAmountRequired = (etcAmount * tokenReserve) / etcReserve;
            require(tokenAmount >= tokenAmountRequired, "Insufficient token amount provided");

            token.safeTransferFrom(provider, address(this), tokenAmountRequired);
            liquidity = (etcAmount * _totalLiquidity) / etcReserve;
            _totalLiquidity += liquidity;
        }

        _liquidityProviders[provider] = _liquidityProviders[provider].add(liquidity);
        _stakingTimestamps[provider] = block.timestamp; // Update staking timestamp
        _mint(provider, liquidity);
        _updateReward(provider);
        _addHistoricalEvent("LiquidityAdded", liquidity);

        emit LiquidityAdded(provider, tokenAmount, etcAmount, liquidity);
    }

    function removeLiquidity(uint256 liquidity) external nonReentrant returns (uint256 etcAmount, uint256 tokenAmount) {
        require(liquidity > 0 && liquidity <= _liquidityProviders[msg.sender], "Invalid liquidity amount");

        uint256 etcReserve = getETCReserve();
        uint256 tokenReserve = getTokenReserve();

        etcAmount = (liquidity * etcReserve) / _totalLiquidity;
        tokenAmount = (liquidity * tokenReserve) / _totalLiquidity;

        _totalLiquidity -= liquidity;
        _liquidityProviders[msg.sender] = _liquidityProviders[msg.sender].sub(liquidity);
        _burn(msg.sender, liquidity);
        _updateReward(msg.sender);
        _addHistoricalEvent("LiquidityRemoved", liquidity);

        payable(msg.sender).transfer(etcAmount);
        token.safeTransfer(msg.sender, tokenAmount);

        emit LiquidityRemoved(msg.sender, tokenAmount, etcAmount, liquidity);
    }

    function swapETCForTokensWithSlippage(uint256 minTokens) external payable nonReentrant validReserves {
        uint256 tokenReserve = getTokenReserve();
        uint256 tokensBought = _getAmountOfTokens(msg.value, getETCReserve() - msg.value, tokenReserve);
        require(tokensBought >= minTokens, "Slippage too high");

        token.safeTransfer(msg.sender, tokensBought);
        _addHistoricalEvent("SwapETCForTokens", msg.value);

        emit SwapETCForTokens(msg.sender, msg.value, tokensBought);
    }

    function swapTokensForETCWithSlippage(uint256 tokenAmount, uint256 minETC) external nonReentrant validReserves {
        uint256 etcReserve = getETCReserve();
        uint256 etcBought = _getAmountOfTokens(tokenAmount, getTokenReserve(), etcReserve);
        require(etcBought >= minETC, "Slippage too high");

        token.safeTransferFrom(msg.sender, address(this), tokenAmount);
        payable(msg.sender).transfer(etcBought);
        _addHistoricalEvent("SwapTokensForETC", tokenAmount);

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

    function setFeeAddress(address _feeAddress) external onlyOwner {
        require(_feeAddress != address(0), "Invalid fee address");
        feeAddress = _feeAddress;
        emit FeeAddressUpdated(_feeAddress);
    }

    function withdrawFees() external {
        require(feeAddress != address(0), "Fee address not set");
        uint256 balance = address(this).balance;
        payable(feeAddress).transfer(balance);
    }

    function autoCompound() external nonReentrant {
        _updateReward(msg.sender);
        uint256 reward = _rewards[msg.sender];
        require(reward > 0, "No rewards available");

        _rewards[msg.sender] = 0;
        _addLiquidity(reward, reward, msg.sender); // Automatically adds the reward as liquidity
    }

    function lockLiquidity(uint256 amount, uint256 lockPeriod) external {
        require(_liquidityProviders[msg.sender] >= amount, "Insufficient liquidity");

        _liquidityProviders[msg.sender] = _liquidityProviders[msg.sender].sub(amount);
        _lockedLiquidity[msg.sender] = LockedLiquidity({
            amount: amount,
            unlockTime: block.timestamp.add(lockPeriod)
        });
        _addHistoricalEvent("LiquidityLocked", amount);

        emit LiquidityLocked(msg.sender, amount, block.timestamp.add(lockPeriod));
    }

    function unlockLiquidity() external {
        require(block.timestamp >= _lockedLiquidity[msg.sender].unlockTime, "Liquidity still locked");

        _liquidityProviders[msg.sender] = _liquidityProviders[msg.sender].add(_lockedLiquidity[msg.sender].amount);
        _addHistoricalEvent("LiquidityUnlocked", _lockedLiquidity[msg.sender].amount);
        emit LiquidityUnlocked(msg.sender, _lockedLiquidity[msg.sender].amount);

        delete _lockedLiquidity[msg.sender];
    }

    function _mint(address to, uint256 amount) private {
        _liquidityTokens[to] = _liquidityTokens[to].add(amount);
    }

    function _burn(address from, uint256 amount) private {
        _liquidityTokens[from] = _liquidityTokens[from].sub(amount);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _liquidityTokens[account];
    }

    function totalSupply() public view returns (uint256) {
        return _totalLiquidity;
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

    function _getAmountOfTokens(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public view returns (uint256) {
        uint256 inputAmountWithFee = inputAmount.mul(1000  - feePercentage);
        uint256 numerator = inputAmountWithFee.mul(outputReserve);
        uint256 denominator = inputReserve.mul(1000).add(inputAmountWithFee);
        return numerator / denominator;
    }

    function _addHistoricalEvent(string memory eventType, uint256 amount) private {
        history.push(HistoricalEvent({
            timestamp: block.timestamp,
            eventType: eventType,
            amount: amount
        }));
    }
}
