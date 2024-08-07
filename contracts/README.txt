The `MinkRewards` contract is designed for staking ERC20 tokens with varying lock periods and rewarding users based on their stake. It supports functions for staking, unstaking, claiming rewards, and managing contract parameters. It also includes functionality to track and query staking and reward history.


1. **Imports**
The contract imports several components from the OpenZeppelin library:
- `Ownable`: Provides ownership and access control functionality.
- `ReentrancyGuard`: Helps prevent reentrant attacks by guarding functions against reentrancy.
- `IERC20`: Interface for interacting with ERC20 tokens.

2. **Contract Definition**
`MinkRewards` is a smart contract designed to manage staking and reward mechanisms. It extends the functionality of `Ownable` and `ReentrancyGuard` to manage ownership and prevent reentrancy attacks.

3. **State Variables**
- **`totalStaked`**: The total amount of tokens staked by all users.
- **`totalRewardsDistributed`**: The total amount of rewards distributed to users.
- **`minkToken`**: An instance of the ERC20 token used for staking and rewards.
- **`penaltyPercentage`**: The percentage of rewards lost if a user unstake tokens before the end of the lock period.
- **`minStakeAmount90Days`, `minStakeAmount180Days`, `minStakeAmount365Days`**: Minimum stake amounts required for different lock periods.
- **`lockPeriod90Days`, `lockPeriod180Days`, `lockPeriod365Days`**: Lock periods corresponding to 90, 180, and 365 days.
- **`rewardRate`**: The rate at which rewards are calculated.
- **`REWARD_SCALE`**: A constant used to scale reward calculations to a fixed precision.

4. **Events**
Events are used to log significant actions on the blockchain:
- **`Staked`**: Emitted when tokens are staked.
- **`Unstaked`**: Emitted when tokens are unstaked.
- **`RewardPaid`**: Emitted when rewards are claimed.
- **`RewardRateUpdated`**: Emitted when the reward rate is updated.
- **`MinimumStakeAmountsUpdated`**: Emitted when the minimum stake amounts are updated.
- **`PenaltyPercentageUpdated`**: Emitted when the penalty percentage is updated.

5. **Constructor**
The constructor initializes the contract:
- Sets the address of the `minkToken` (ERC20 token).
- Sets the initial owner of the contract.
- Ensures the token address is valid.

6. **Functions**
- **`stake(uint256 _amount, uint256 _lockPeriod)`**: Allows users to stake tokens for a specified lock period. It checks the minimum stake amount, updates user rewards, and records staking history.
- **`unstake(uint256 _amount)`**: Allows users to unstake their tokens. It ensures that the tokens are unlocked and updates the total staked amount. Penalties are applied if all tokens are unstaked before the lock period ends.
- **`claimReward()`**: Allows users to claim their accumulated rewards. Updates the total rewards distributed and records the reward history.
- **`updateReward(address _user)`**: Internal function to calculate and update the rewards for a specific user based on their stake and the elapsed time.
- **`getStakingDuration(address _user)`**: Returns the duration since the user staked their tokens.
- **`getLockEndTime(address _user)`**: Returns the lock end time for a user's tokens.
- **`getStakingHistory(address _user)`**: Returns the staking history of a user.
- **`getRewardHistory(address _user)`**: Returns the reward history of a user.
- **`updateRewardRate(uint256 _newRate)`**: Allows the contract owner to update the reward rate.
- **`updateMinimumStakeAmounts(uint256 _min90Days, uint256 _min180Days, uint256 _min365Days)`**: Allows the contract owner to update the minimum stake amounts for different lock periods.
- **`updatePenaltyPercentage(uint256 _newPenaltyPercentage)`**: Allows the contract owner to update the penalty percentage for early unstaking.
- **`getStakedBalance(address _user)`**: Returns the staked balance of a user.
- **`getRewardBalance(address _user)`**: Returns the current reward balance of a user.
- **`calculateReward(address _user)`**: Calculates the total rewards a user has accumulated.
- **`calculateAPY()`**: Calculates the annual percentage yield (APY) for rewards based on the current reward rate.
- **`getTotalRewardsDistributed()`**: Returns the total rewards distributed across all users.
