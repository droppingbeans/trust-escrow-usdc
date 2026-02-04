// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TrustEscrow
 * @dev Lean escrow for agent-to-agent commerce with USDC
 * @notice Demonstrates why agents are faster/cheaper than humans for escrow
 */
contract TrustEscrow is ReentrancyGuard {
    IERC20 public immutable usdc;
    
    struct Escrow {
        address sender;
        address receiver;
        uint256 amount;
        uint256 deadline;
        bool released;
        bool disputed;
    }
    
    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;
    
    event EscrowCreated(uint256 indexed escrowId, address indexed sender, address indexed receiver, uint256 amount, uint256 deadline);
    event EscrowReleased(uint256 indexed escrowId, address indexed releaser);
    event EscrowDisputed(uint256 indexed escrowId, address indexed disputer);
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }
    
    /**
     * @dev Create escrow - instant for agents (no KYC/forms)
     * @param receiver Agent receiving payment after delivery
     * @param amount USDC amount (6 decimals)
     * @param deadline Unix timestamp for auto-release
     */
    function createEscrow(
        address receiver,
        uint256 amount,
        uint256 deadline
    ) external nonReentrant returns (uint256 escrowId) {
        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Amount must be > 0");
        require(deadline > block.timestamp, "Deadline must be future");
        
        // Transfer USDC from sender to contract
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            sender: msg.sender,
            receiver: receiver,
            amount: amount,
            deadline: deadline,
            released: false,
            disputed: false
        });
        
        emit EscrowCreated(escrowId, msg.sender, receiver, amount, deadline);
    }
    
    /**
     * @dev Sender releases payment early (work delivered)
     * @param escrowId ID of the escrow
     */
    function release(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.sender == msg.sender, "Only sender can release");
        require(!escrow.released, "Already released");
        require(!escrow.disputed, "Escrow disputed");
        
        escrow.released = true;
        require(usdc.transfer(escrow.receiver, escrow.amount), "Transfer failed");
        
        emit EscrowReleased(escrowId, msg.sender);
    }
    
    /**
     * @dev Auto-release after deadline (anyone can call)
     * @param escrowId ID of the escrow
     */
    function autoRelease(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.released, "Already released");
        require(!escrow.disputed, "Escrow disputed");
        require(block.timestamp >= escrow.deadline, "Deadline not reached");
        
        escrow.released = true;
        require(usdc.transfer(escrow.receiver, escrow.amount), "Transfer failed");
        
        emit EscrowReleased(escrowId, msg.sender);
    }
    
    /**
     * @dev Flag dispute (freezes funds for manual resolution)
     * @param escrowId ID of the escrow
     */
    function dispute(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.sender || msg.sender == escrow.receiver, "Only parties can dispute");
        require(!escrow.released, "Already released");
        require(!escrow.disputed, "Already disputed");
        
        escrow.disputed = true;
        emit EscrowDisputed(escrowId, msg.sender);
    }
    
    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (
        address sender,
        address receiver,
        uint256 amount,
        uint256 deadline,
        bool released,
        bool disputed
    ) {
        Escrow memory escrow = escrows[escrowId];
        return (
            escrow.sender,
            escrow.receiver,
            escrow.amount,
            escrow.deadline,
            escrow.released,
            escrow.disputed
        );
    }
}
