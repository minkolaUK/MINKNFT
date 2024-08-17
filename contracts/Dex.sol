// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ETCDex is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public feePercentage = 3; // 0.3% fee (3/1000)
    uint256 private _totalLiquidity; // Tracks total liquidity for mint/burn

    event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 etcAmount, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 etcAmount, uint256 liquidity);
    event SwapETCForTokens(address indexed user, uint256 etcAmount, uint256 tokenAmount);
    event SwapTokensForETC(address indexed user, uint256 tokenAmount, uint256 etcAmount);

    // Constructor to set the initial owner and token
    constructor(IERC20 _token, address payable initialOwner) Ownable(initialOwner) {
        require(address(_token) != address(0), "Token address cannot be zero");
        token = _token;
        transferOwnership(initialOwner); // Set the initial owner
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
            // Initial liquidity provision
            token.safeTransferFrom(msg.sender, address(this), tokenAmount);
            liquidity = msg.value;
            _totalLiquidity += liquidity;
            emit LiquidityAdded(msg.sender, tokenAmount, msg.value, liquidity);
        } else {
            uint256 etcAmount = msg.value;
            uint256 tokenAmountRequired = (etcAmount * tokenReserve) / etcReserve;
            require(tokenAmount >= tokenAmountRequired, "Insufficient token amount provided");

            token.safeTransferFrom(msg.sender, address(this), tokenAmountRequired);
            liquidity = (etcAmount * _totalLiquidity) / etcReserve;
            _totalLiquidity += liquidity;
            emit LiquidityAdded(msg.sender, tokenAmountRequired, etcAmount, liquidity);
        }

        _mint(msg.sender, liquidity);
    }

    function removeLiquidity(uint256 liquidity) external nonReentrant returns (uint256 etcAmount, uint256 tokenAmount) {
        require(liquidity > 0 && liquidity <= _totalLiquidity, "Invalid liquidity amount");

        uint256 etcReserve = getETCReserve();
        uint256 tokenReserve = getTokenReserve();

        etcAmount = (liquidity * etcReserve) / _totalLiquidity;
        tokenAmount = (liquidity * tokenReserve) / _totalLiquidity;

        _totalLiquidity -= liquidity;
        _burn(msg.sender, liquidity);

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
        // Example: _balances[to] += amount;
    }

    function _burn(address from, uint256 amount) private {
        // Internal logic for burning liquidity tokens
        // Placeholder implementation
        // Example: _balances[from] -= amount;
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 100, "Fee percentage too high"); // Max fee 10%
        feePercentage = _feePercentage;
    }

    function totalSupply() public view returns (uint256) {
        return _totalLiquidity;
    }
}
