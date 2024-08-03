[
  {
    "type": "constructor",
    "name": "",
    "inputs": [
      {
        "type": "address",
        "name": "_minkToken",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "EmergencyWithdraw",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true,
        "internalType": "address"
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "type": "address",
        "name": "previousOwner",
        "indexed": true,
        "internalType": "address"
      },
      {
        "type": "address",
        "name": "newOwner",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "outputs": [],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardsClaimed",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true,
        "internalType": "address"
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Staked",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true,
        "internalType": "address"
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "lockPeriod",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StakingOptionUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "period",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "apy",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "earlyUnstakeFee",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "minAmount",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "maxAmount",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "type": "bool",
        "name": "active",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unstaked",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true,
        "internalType": "address"
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "anonymous": false
  },
  {
    "type": "function",
    "name": "calculatePendingRewards",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculateReward",
    "inputs": [
      {
        "type": "uint256",
        "name": "amount",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "lockPeriod",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimRewards",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "emergencyWithdraw",
    "inputs": [
      {
        "type": "uint256",
        "name": "stakeIndex",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getStakingOptions",
    "inputs": [
      {
        "type": "uint256",
        "name": "lockPeriod",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "period",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "apy",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "earlyUnstakeFee",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "minAmount",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "maxAmount",
            "internalType": "uint256"
          },
          {
            "type": "bool",
            "name": "active",
            "internalType": "bool"
          }
        ],
        "internalType": "struct minkStaking.StakingOption"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserStakes",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "type": "tuple[]",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "amount",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "lockPeriod",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "stakeTime",
            "internalType": "uint256"
          }
        ],
        "internalType": "struct minkStaking.Stake[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "minkToken",
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingRewards",
    "inputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setStakingOption",
    "inputs": [
      {
        "type": "uint256",
        "name": "period",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "apy",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "earlyUnstakeFee",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "minAmount",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "maxAmount",
        "internalType": "uint256"
      },
      {
        "type": "bool",
        "name": "active",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stake",
    "inputs": [
      {
        "type": "uint256",
        "name": "amount",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "lockPeriod",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stakeWithCustomPeriod",
    "inputs": [
      {
        "type": "uint256",
        "name": "amount",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "lockPeriod",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stakes",
    "inputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "address"
      },
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "amount",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "lockPeriod",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "stakeTime",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "stakingOptions",
    "inputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "period",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "apy",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "earlyUnstakeFee",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "minAmount",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "maxAmount",
        "internalType": "uint256"
      },
      {
        "type": "bool",
        "name": "active",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "type": "address",
        "name": "newOwner",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unstake",
    "inputs": [
      {
        "type": "uint256",
        "name": "stakeIndex",
        "internalType": "uint256"
      },
      {
        "type": "bool",
        "name": "early",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]