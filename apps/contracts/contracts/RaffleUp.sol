// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title RaffleUp - Simple number-based raffle dApp on Celo using cUSD.
 * @author 
 *
 * - Owner creates raffles.
 * - Users pick numbers & pay entryPrice in cUSD.
 * - Agent closes raffles, selects winners, distributes equal payouts.
 * - Refund only when entries == 1.
 * - Platform fee = 1% of totalCollected.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract RaffleUp is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable cUSD;
    address public agent;

    uint256 public constant FEE_BASIS_POINTS = 100; // 1%
    uint256 public raffleCount;
    uint256 public accumulatedFees; // stores only platform fees

    struct Raffle {
        uint256 id;
        uint256 startNumber;
        uint256 endNumber;
        uint256 startTime;
        uint256 endTime;
        uint256 entryPrice;
        uint256 totalCollected;
        uint256 totalEntries;
        bool closed;
        bool paused;
        address[] winners;
    }

    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => mapping(uint256 => address)) public numberOwner;
    mapping(uint256 => mapping(uint256 => bool)) public numberTaken;
    mapping(uint256 => uint256[]) public purchasedNumbers;

    event RaffleCreated(uint256 raffleId, uint256 startNum, uint256 endNum, uint256 entryPrice, uint256 start, uint256 end);
    event NumberPurchased(uint256 raffleId, uint256 number, address buyer);
    event RaffleClosed(uint256 raffleId, address[] winners, uint256 totalDistributable);
    event RaffleRefunded(uint256 raffleId);
    event AgentChanged(address oldAgent, address newAgent);
    event PlatformFeesWithdrawn(address to, uint256 amount);
    event RafflePaused(uint256 raffleId);
    event RaffleUnpaused(uint256 raffleId);

    modifier onlyAgent() {
        require(msg.sender == agent, "caller-not-agent");
        _;
    }

    constructor(address _cUSD, address _agent) Ownable(msg.sender){
        require(_cUSD != address(0), "invalid cUSD");
        require(_agent != address(0), "invalid agent");
        cUSD = IERC20(_cUSD);
        agent = _agent;
    }

    function setAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "invalid agent");
        emit AgentChanged(agent, _agent);
        agent = _agent;
    }

    // ---------------------------------------------------------
    // CREATE RAFFLE
    // ---------------------------------------------------------
    function createRaffle(
        uint256 startNumber,
        uint256 endNumber,
        uint256 entryPrice,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(endNumber >= startNumber, "invalid range");
        require(endTime > startTime, "invalid times");
        require(endTime > block.timestamp, "must be future");
        require(entryPrice > 0, "price > 0");

        raffleCount++;
        Raffle storage r = raffles[raffleCount];
        r.id = raffleCount;
        r.startNumber = startNumber;
        r.endNumber = endNumber;
        r.startTime = startTime;
        r.endTime = endTime;
        r.entryPrice = entryPrice;

        emit RaffleCreated(raffleCount, startNumber, endNumber, entryPrice, startTime, endTime);
        return raffleCount;
    }

    // ---------------------------------------------------------
    // JOIN RAFFLE
    // ---------------------------------------------------------
    function joinRaffle(uint256 raffleId, uint256[] calldata numbers) external nonReentrant whenNotPaused {
        require(numbers.length > 0, "no numbers");

        Raffle storage r = raffles[raffleId];
        require(r.id != 0, "not-exist");
        require(!r.closed, "closed");
        require(!r.paused, "paused");
        require(block.timestamp >= r.startTime, "not-started");
        require(block.timestamp < r.endTime, "ended");

        uint256 totalCost = r.entryPrice * numbers.length;
        require(cUSD.transferFrom(msg.sender, address(this), totalCost), "transfer-failed");

        for (uint256 i = 0; i < numbers.length; i++) {
            uint256 num = numbers[i];
            require(num >= r.startNumber && num <= r.endNumber, "out-of-range");
            require(!numberTaken[raffleId][num], "taken");

            numberTaken[raffleId][num] = true;
            numberOwner[raffleId][num] = msg.sender;
            purchasedNumbers[raffleId].push(num);

            emit NumberPurchased(raffleId, num, msg.sender);
        }

        r.totalEntries += numbers.length;
        r.totalCollected += totalCost;
    }

    // ---------------------------------------------------------
    // CLOSE RAFFLE (DETERMINE WINNERS + PAYOUT)
    // ---------------------------------------------------------
    function closeRaffle(uint256 raffleId) external onlyAgent nonReentrant whenNotPaused {
        Raffle storage r = raffles[raffleId];
        require(!r.closed, "closed");
        require(block.timestamp >= r.endTime, "not-ended");

        uint256 entries = r.totalEntries;

        // --- REFUND CONDITION ---
        if (entries == 1) revert("use refundRaffle() for 1 entry only");

        require(entries >= 2, "no participants");

        // winnersCount rule: 1 per 10 entries
        uint256 winnersCount = entries / 10;

        // If entries >= 2 but winnersCount == 0, force 1 winner
        if (winnersCount == 0) winnersCount = 1;

        uint256[] storage pool = purchasedNumbers[raffleId];
        require(pool.length == entries, "pool mismatch");

        // calculate platform fee
        uint256 fee = (r.totalCollected * FEE_BASIS_POINTS) / 10000;
        accumulatedFees += fee;

        uint256 distributable = r.totalCollected - fee;
        uint256 equalShare = distributable / winnersCount;

        address[] memory winners = new address[](winnersCount);

        bool[] memory usedIndex = new bool[](pool.length);
        uint256 chosen = 0;
        uint256 nonce = 0;

        while (chosen < winnersCount) {
            uint256 randIdx = uint256(
                keccak256(abi.encodePacked(block.timestamp,block.prevrandao,msg.sender,nonce,raffleId))
            ) % pool.length;

            if (usedIndex[randIdx]) {
                nonce++;
                continue;
            }

            usedIndex[randIdx] = true;

            uint256 winningNumber = pool[randIdx];
            address winnerAddr = numberOwner[raffleId][winningNumber];

            if (winnerAddr == address(0)) {
                nonce++;
                continue;
            }

            winners[chosen] = winnerAddr;
            r.winners.push(winnerAddr);

            require(cUSD.transfer(winnerAddr, equalShare), "pay-failed");

            chosen++;
            nonce++;
        }

        r.closed = true;

        emit RaffleClosed(raffleId, winners, distributable);
    }

    // ---------------------------------------------------------
    // REFUND IF ONLY 1 ENTRY
    // ---------------------------------------------------------
    function refundRaffle(uint256 raffleId) external onlyAgent nonReentrant whenNotPaused {
        Raffle storage r = raffles[raffleId];
        require(!r.closed, "closed");
        require(block.timestamp >= r.endTime, "not-ended");
        require(r.totalEntries == 1, "refund only when 1 entry");

        uint256[] storage pool = purchasedNumbers[raffleId];
        uint256 number = pool[0];
        address participant = numberOwner[raffleId][number];

        require(cUSD.transfer(participant, r.entryPrice), "refund-failed");

        // cleanup
        numberOwner[raffleId][number] = address(0);
        numberTaken[raffleId][number] = false;
        delete purchasedNumbers[raffleId];

        r.closed = true;

        emit RaffleRefunded(raffleId);
    }

    // ---------------------------------------------------------
    // PAUSE / UNPAUSE RAFFLE
    // ---------------------------------------------------------
    function pauseRaffle(uint256 raffleId) external onlyOwner {
        raffles[raffleId].paused = true;
        emit RafflePaused(raffleId);
    }

    function unpauseRaffle(uint256 raffleId) external onlyOwner {
        raffles[raffleId].paused = false;
        emit RaffleUnpaused(raffleId);
    }

    // ---------------------------------------------------------
    // WITHDRAW ONLY PLATFORM FEES
    // ---------------------------------------------------------
    function withdrawPlatformFees(address to) external onlyOwner nonReentrant {
        require(to != address(0), "invalid address");
        uint256 amount = accumulatedFees;
        require(amount > 0, "no fees");

        accumulatedFees = 0; // reset
        require(cUSD.transfer(to, amount), "withdraw-failed");

        emit PlatformFeesWithdrawn(to, amount);
    }

    // -------------------- VIEW HELPERS -----------------------
    function getPurchasedNumbers(uint256 raffleId) external view returns (uint256[] memory) {
        return purchasedNumbers[raffleId];
    }

    function getRaffleWinners(uint256 raffleId) external view returns (address[] memory) {
        return raffles[raffleId].winners;
    }

    function isNumberAvailable(uint256 raffleId, uint256 number) external view returns (bool) {
        return !numberTaken[raffleId][number];
    }

    function pauseContract() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }
}
