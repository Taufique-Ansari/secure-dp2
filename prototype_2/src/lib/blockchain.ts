import Web3 from 'web3';

// Define the ABI directly in the file
const PrivacyContractABI = [
  {
    "inputs": [],
    "name": "getUserPrivacyParams",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "epsilon",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "delta",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PrivacyContract.PrivacyParameters[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_epsilon",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_delta",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "_dataHash",
        "type": "bytes32"
      }
    ],
    "name": "setPrivacyParameters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_consent",
        "type": "bool"
      }
    ],
    "name": "setUserConsent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "hasUserConsent",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let web3Instance: any;
let privacyContractInstance: any;

// Initialize web3 and contract only if they're used
const initWeb3 = () => {
  if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
    // If we're in the browser and MetaMask is installed
    web3Instance = new Web3((window as any).ethereum);
  } else {
    // If we're on the server or MetaMask is not installed
    web3Instance = new Web3(
      new Web3.providers.HttpProvider(
        `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      )
    );
  }
  return web3Instance;
};

// Initialize contract instance
const initContract = () => {
  const contractAddress = process.env.NEXT_PUBLIC_PRIVACY_CONTRACT_ADDRESS;
  
  if (!web3Instance) {
    initWeb3();
  }
  
  if (contractAddress) {
    privacyContractInstance = new web3Instance.eth.Contract(
      PrivacyContractABI,
      contractAddress
    );
  } else {
    console.error('Contract address not found in environment variables');
  }
  
  return privacyContractInstance;
};

export const web3 = initWeb3();
export const privacyContract = initContract();
export const contractAddress = process.env.NEXT_PUBLIC_PRIVACY_CONTRACT_ADDRESS; // Export this for debugging 