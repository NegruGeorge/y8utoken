// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import "./Y8uERC20.sol";

contract Y8uDistributor is Ownable, ReentrancyGuard {
    using SafeERC20 for Y8uERC20;

    uint256 public constant PRIVATE_SALE =  20_000_000 * (10 ** uint256(18));
    uint256 public constant STRATEGIC_SALE =  25_000_000 * (10 ** uint256(18));
    uint256 public constant STRATEGIC_SALE_2 =  10_000_000 * (10 ** uint256(18));
    uint256 public constant PUBLIC_SALE =  5_000_000 * (10 ** uint256(18));
    uint256 public constant AIRDROP =  5_000_000 * (10 ** uint256(18));
    uint256 public constant TEAM =  100_000_000 * (10 ** uint256(18));
    uint256 public constant MARKETING =  95_000_000 * (10 ** uint256(18));
    uint256 public constant TREASURY =  100_000_000 * (10 ** uint256(18));
    uint256 public constant DEVELOPMENT =  100_000_000 * (10 ** uint256(18));
    uint256 public constant AI_MINING =  100_000_000 * (10 ** uint256(18));
    uint256 public constant LIQUIDITY_EXCHANGES_MM =  80_000_000 * (10 ** uint256(18));
    uint256 public constant ECOSYSTEM =  360_000_000 * (10 ** uint256(18));
    
    bytes32 public merkleRootPrivateSale;
    bytes32 public merkleRootStrategicSale;
    bytes32 public merkleRootStrategicSale2;

    uint256 public tgeTimestamp;

    uint256 public totalClaimedPrivateSale;
    uint256 public totalClaimedStrategicSale;
    uint256 public totalClaimedStrategicSale2;
    uint256 public totalClaimedPublicSale = 5_000_000 * (10 ** uint256(18));
    uint256 public totalClaimedAirdrop;
    uint256 public totalClaimedTeam;
    uint256 public totalClaimedMarketing;
    uint256 public totalClaimedTreasury;
    uint256 public totalClaimedDevelopment;
    uint256 public totalClaimedAiMining;
    uint256 public totalClaimedLiquidityExchangesMM = 80_000_000 * (10 ** uint256(18));
    uint256 public totalClaimedEcosystem;

    mapping(address => uint256 ) public claimedAmountsPrivateSale;
    mapping(address => uint256 ) public claimedAmountsStrategicSale;
    mapping(address => uint256 ) public claimedAmountsStrategicSale2;

    event Claimed(address indexed account, uint256 amount);

    Y8uERC20 public y8u;
    
    constructor(address initialOwner) Ownable(initialOwner) {
        y8u = new Y8uERC20(address(this));

        // mint public sale
        y8u.mint(initialOwner, PUBLIC_SALE);

        // mint liquidity, exchanges, MM
        y8u.mint(initialOwner, LIQUIDITY_EXCHANGES_MM);
    }
    
    function setTgeTimestamp() external onlyOwner {
        tgeTimestamp = block.timestamp;
    }


   function setMerkleRootPrivateSale(bytes32 _merkleRoot) public onlyOwner {
        merkleRootPrivateSale = _merkleRoot;
    }


    function setMerkleRootStrategicSale(bytes32 _merkleRoot) public onlyOwner {
        merkleRootStrategicSale = _merkleRoot;
    }


    function setMerkleRootStrategicSale2(bytes32 _merkleRoot) public onlyOwner {
        merkleRootStrategicSale2 = _merkleRoot;
    }

    function claimPrivateSale(uint256 totalAllocation, bytes32[] calldata merkleProof) external nonReentrant {
        require(tgeTimestamp != 0, "TGE not started");
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, totalAllocation))));

        require(MerkleProof.verify(merkleProof, merkleRootPrivateSale, leaf), "Invalid Merkle proof Private sale");

        uint256 claimable = calculateClaimablePrivateSale(totalAllocation, msg.sender);
        require(claimable > 0, "No tokens are claimable");
        require(totalClaimedPrivateSale + claimable <= PRIVATE_SALE, "Private sale allocation is 100%");
        claimedAmountsPrivateSale[msg.sender] += claimable;
        totalClaimedPrivateSale +=claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    function calculateClaimablePrivateSale(uint256 totalAllocation, address account) public view returns (uint256) {
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution == 1) {
            totalClaimable = totalAllocation * 200_000 / 20_000_000; // At TGE
        } else if (monthOfDistribution == 2) {
            totalClaimable = totalAllocation * 400_000 / 20_000_000; // Month 2
        } else if (monthOfDistribution == 3) {
            totalClaimable = totalAllocation * 600_000 / 20_000_000; // Month 3
        } else if (monthOfDistribution >= 4 && monthOfDistribution <= 23) {
            uint256 monthlyReleaseForMonths4To23 = totalAllocation * 970_000 / 20_000_000; // Monthly release for months 4 to 23
            totalClaimable = totalAllocation * 600_000 / 20_000_000 + (monthOfDistribution - 3) * monthlyReleaseForMonths4To23;
        } else if (monthOfDistribution > 23) {
            totalClaimable = totalAllocation; // Entire allocation is available after 23 months
        }
        if(totalClaimable > totalAllocation){
            totalClaimable = totalAllocation;
        }
        uint256 alreadyClaimed = claimedAmountsPrivateSale[account];
        return totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
    }


    function claimStrategicSale(uint256 totalAllocation, bytes32[] calldata merkleProof) external nonReentrant {
        require(tgeTimestamp != 0, "TGE not started");
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, totalAllocation))));
        require(MerkleProof.verify(merkleProof, merkleRootStrategicSale, leaf), "Invalid Merkle proof Strategic sale");

        uint256 claimable = calculateClaimableStrategicSale(totalAllocation, msg.sender);
        require(claimable > 0, "No tokens are claimable");
        require(totalClaimedStrategicSale + claimable <= STRATEGIC_SALE, "Strategic sale allocation is 100%");

        claimedAmountsStrategicSale[msg.sender] += claimable;
        totalClaimedStrategicSale += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    function calculateClaimableStrategicSale(uint256 totalAllocation, address account) public view returns (uint256) {
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution == 1) {
            totalClaimable = totalAllocation * 2_500_000 / 25_000_000; // At TGE
        } else if (monthOfDistribution == 2) {
            totalClaimable = totalAllocation * 2_750_000 / 25_000_000; // Month 2
        } else if (monthOfDistribution == 3) {
            totalClaimable = totalAllocation * 3_000_000 / 25_000_000; // Month 3
        } else if (monthOfDistribution >= 4 && monthOfDistribution <= 22) {
            uint256 monthlyReleaseForMonths4To22 = totalAllocation * 1_157_895 / 25_000_000; // Monthly release for months 4 to 22
            totalClaimable = totalAllocation * 3_000_000 / 25_000_000 + (monthOfDistribution - 3) * monthlyReleaseForMonths4To22;
        } else if (monthOfDistribution > 22) {
            totalClaimable = totalAllocation; // Entire allocation is available after 22 months
        }

        uint256 alreadyClaimed = claimedAmountsStrategicSale[account];
        if(totalClaimable > totalAllocation){
            totalClaimable = totalAllocation;
        }
        return totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
    }


    function claimStrategicSale2(uint256 totalAllocation, bytes32[] calldata merkleProof) external nonReentrant {
        require(tgeTimestamp != 0, "TGE not started");
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, totalAllocation))));
        require(MerkleProof.verify(merkleProof, merkleRootStrategicSale2, leaf), "Invalid Merkle proof Strategic sale 2");

        uint256 claimable = calculateClaimableStrategicSale2(totalAllocation, msg.sender);
        require(claimable > 0, "No tokens are claimable");
        require(totalClaimedStrategicSale2 + claimable <= STRATEGIC_SALE_2, "Strategic sale 2 allocation is 100%");

        claimedAmountsStrategicSale2[msg.sender] += claimable;
        totalClaimedStrategicSale2 += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    function calculateClaimableStrategicSale2(uint256 totalAllocation, address account) public view returns (uint256) {
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution == 1) {
            totalClaimable = totalAllocation * 100_000 / 10_000_000; // At TGE
        } else if (monthOfDistribution == 2) {
            totalClaimable = totalAllocation * 200_000 / 10_000_000; // Month 2
        } else if (monthOfDistribution == 3) {
            totalClaimable = totalAllocation * 300_000 / 10_000_000; // Month 3
        } else if (monthOfDistribution >= 4 && monthOfDistribution <= 23) {
            uint256 monthlyReleaseForMonths4To23 = totalAllocation * 485_000 / 10_000_000; // Monthly release for months 4 to 23
            totalClaimable = totalAllocation * 300_000 / 10_000_000 + (monthOfDistribution - 3) * monthlyReleaseForMonths4To23;
        } else if (monthOfDistribution > 23) {
            totalClaimable = totalAllocation; // Entire allocation is available after 23 months
        }

        if(totalClaimable > totalAllocation){
            totalClaimable = totalAllocation;
        }
        uint256 alreadyClaimed = claimedAmountsStrategicSale2[account];
        return totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
    }


    function claimAirdrop() external onlyOwner {
        require(tgeTimestamp != 0, "TGE not started");

        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution >= 1 && monthOfDistribution <= 5) {
            totalClaimable = 1_000_000 * (10 ** uint256(18)) * monthOfDistribution ;  // Monthly release for months 1 to 5
        } else if (monthOfDistribution > 5) {
            totalClaimable = 5_000_000 * (10 ** uint256(18)); // Entire allocation is available after 46 months
        }

        uint256 alreadyClaimed = totalClaimedAirdrop;

        if(totalClaimable > AIRDROP){
            totalClaimable = AIRDROP;
        }
        uint256 claimable = totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
        require(claimable != 0, "claimable amount is 0");

        require(totalClaimedAirdrop + claimable <= AIRDROP, "Airdrop allocation is 100%");

        totalClaimedAirdrop += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);

    }

    function claimTeam() external onlyOwner {
        require(tgeTimestamp != 0, "TGE not started");
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution >= 11 && monthOfDistribution <= 46) {
            totalClaimable = 2_777_778 * (10 ** uint256(18)) * (monthOfDistribution - 10);  // Monthly release for months 11 to 46
        } else if (monthOfDistribution > 46) {
            totalClaimable = 100_000_000 * (10 ** uint256(18)); // Entire allocation is available after 46 months
        }

        uint256 alreadyClaimed = totalClaimedTeam;

        if(totalClaimable > TEAM){
            totalClaimable = TEAM;
        }
        uint256 claimable = totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
        require(claimable != 0, "claimable amount is 0");

        require(totalClaimedTeam + claimable <= TEAM, "Team allocation is 100%");

        totalClaimedTeam += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }


    function claimMarketing() external onlyOwner {
        require(tgeTimestamp != 0, "TGE not started");
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution >= 7 && monthOfDistribution <= 42) {
            totalClaimable = 2_638_889 * (10 ** uint256(18)) * (monthOfDistribution - 6);  // Monthly release for months 7 to 42
        } else if (monthOfDistribution > 42) {
            totalClaimable = 95_000_000 * (10 ** uint256(18)); // Entire allocation is available after 42 months
        }

        uint256 alreadyClaimed = totalClaimedMarketing;
        
        if(totalClaimable > MARKETING){
            totalClaimable = MARKETING;
        }
        uint256 claimable = totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
        require(claimable != 0, "claimable amount is 0");

        require(totalClaimedMarketing + claimable <= MARKETING, "Marketing allocation is 100%");

        totalClaimedMarketing += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }


    function claimTreasury() external onlyOwner {
        require(tgeTimestamp != 0, "TGE not started");
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution >= 13 && monthOfDistribution <= 36) {
            totalClaimable = 4_166_667 * (10 ** uint256(18)) * (monthOfDistribution - 12);  // Monthly release for months 13 to 36
        } else if (monthOfDistribution > 36) {
            totalClaimable = 100_000_000 * (10 ** uint256(18)); // Entire allocation is available after 36 months
        }

        uint256 alreadyClaimed = totalClaimedTreasury;
        if(totalClaimable > TREASURY){
            totalClaimable = TREASURY;
        }
        uint256 claimable = totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
        require(claimable != 0, "claimable amount is 0");
        
        require(totalClaimedTreasury + claimable <= TREASURY, "Treasury allocation is 100%");

        totalClaimedTreasury += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }
   
    function claimDevelopment() external onlyOwner {
        require(tgeTimestamp != 0, "TGE not started");
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution >= 2 && monthOfDistribution <= 49) {
            totalClaimable = 2_083_333 * (10 ** uint256(18)) * (monthOfDistribution - 1);  // Monthly release for months 2 to 49
        } else if (monthOfDistribution > 49) {
            totalClaimable = 100_000_000 * (10 ** uint256(18)); // Entire allocation is available after 49 months
        }

        uint256 alreadyClaimed = totalClaimedDevelopment;

        if(totalClaimable > DEVELOPMENT){
            totalClaimable = DEVELOPMENT;
        }
        uint256 claimable = totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
        require(claimable != 0, "claimable amount is 0");

        require(totalClaimedDevelopment + claimable <= DEVELOPMENT, "Development allocation is 100%");

        totalClaimedDevelopment += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    function claimAiMining() external onlyOwner {
        require(tgeTimestamp != 0, "TGE not started");
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution >= 4 && monthOfDistribution <= 39) {
            totalClaimable = 2_777_778 * (10 ** uint256(18)) * (monthOfDistribution - 3);  // Monthly release for months 4 to 39
        } else if (monthOfDistribution > 39) {
            totalClaimable = 100_000_000 * (10 ** uint256(18)); // Entire allocation is available after 39 months
        }

        uint256 alreadyClaimed = totalClaimedAiMining;

        if(totalClaimable > AI_MINING){
            totalClaimable = AI_MINING;
        }
        uint256 claimable = totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
        require(claimable != 0, "claimable amount is 0");

        require(totalClaimedAiMining + claimable <= AI_MINING, "Ai Mining allocation is 100%");

        totalClaimedAiMining += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    function claimEcosystem() external onlyOwner {
        require(tgeTimestamp != 0, "TGE not started");
        uint256 monthOfDistribution = (block.timestamp - tgeTimestamp) / 30 days + 1;
        uint256 totalClaimable;

        if (monthOfDistribution >=1 && monthOfDistribution <5) {
            totalClaimable = 7_200_000 * (10 ** uint256(18)) ; // At TGE
        } else if (monthOfDistribution >= 5 && monthOfDistribution <= 40) {
            uint256 monthlyReleaseForMonths5To40 = 9_800_000 * (10 ** uint256(18));  // Monthly release for months 5 to 40
            totalClaimable = 7_200_000 * (10 ** uint256(18)) + (monthOfDistribution - 4) * monthlyReleaseForMonths5To40;
        } else if (monthOfDistribution > 40) {
            totalClaimable = 360_000_000 * (10 ** uint256(18)); // Entire allocation is available after 40 months
        }

        uint256 alreadyClaimed = totalClaimedEcosystem;

        if(totalClaimable > ECOSYSTEM){
            totalClaimable = ECOSYSTEM;
        }
        uint256 claimable = totalClaimable >= alreadyClaimed ? totalClaimable - alreadyClaimed : 0;
        require(claimable != 0, "claimable amount is 0");

        require(totalClaimedEcosystem + claimable <= ECOSYSTEM, "Ecosystem allocation is 100%");

        totalClaimedEcosystem += claimable;
        y8u.mint(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }
}