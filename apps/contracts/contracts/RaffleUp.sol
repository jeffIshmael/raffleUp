// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title RaffleUp - Simple number-based raffle dApp on Celo using cUSD.
 * @author Jeff Muchiri
 *
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
    uint256 public accumulatedFees;

    struct Raffle {
        uint256 id;
        uint256 startNumber;
        uint256 endNumber;
        uint256 endTime;
        uint256 entryPrice;
        uint256 totalCollected;
        uint256 totalEntries;
        bool closed;
        bool paused;
        address[] winners;
        uint256[] winningNumbers;
    }

    struct WinnerInfo {
        address winnerAddress;
        uint256[] winningNumbers;
        uint256 amountWon;
    }

    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => mapping(uint256 => address)) public numberOwner;
    mapping(uint256 => mapping(uint256 => bool)) public numberTaken;
    mapping(uint256 => uint256[]) public purchasedNumbers;
    
 
    mapping(uint256 => mapping(address => uint256[])) public userSelectedNumbers;
    event RaffleCreated(uint256 raffleId, uint256 startNum, uint256 endNum, uint256 entryPrice, uint256 end);
    event NumberPurchased(uint256 raffleId, uint256 number, address buyer);
    event RaffleClosed(uint256 raffleId, address[] winners, uint256[] winningNumbers, uint256 totalDistributable);
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
        uint256 endTime
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(endNumber >= startNumber, "invalid range");
        require(endTime > block.timestamp, "must be future");
        require(entryPrice > 0, "price > 0");

        raffleCount++;
        Raffle storage r = raffles[raffleCount];
        r.id = raffleCount;
        r.startNumber = startNumber;
        r.endNumber = endNumber;
        r.endTime = endTime;
        r.entryPrice = entryPrice;

        emit RaffleCreated(raffleCount, startNumber, endNumber, entryPrice, endTime);
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
            
            userSelectedNumbers[raffleId][msg.sender].push(num);

            emit NumberPurchased(raffleId, num, msg.sender);
        }

        r.totalEntries += numbers.length;
        r.totalCollected += totalCost;
    }

    // ---------------------------------------------------------
    // CLOSE RAFFLE
    // ---------------------------------------------------------
    function closeRaffle(uint256 raffleId) external onlyAgent nonReentrant whenNotPaused {
        Raffle storage r = raffles[raffleId];
        require(!r.closed, "closed");
        require(block.timestamp >= r.endTime, "not-ended");

        uint256 entries = r.totalEntries;

        if (entries == 1) revert("use refundRaffle() for 1 entry only");
        require(entries >= 2, "no participants");

        uint256 winnersCount = entries / 10;
        if (winnersCount == 0) winnersCount = 1;

        uint256[] storage pool = purchasedNumbers[raffleId];
        require(pool.length == entries, "pool mismatch");

        uint256 fee = (r.totalCollected * FEE_BASIS_POINTS) / 10000;
        accumulatedFees += fee;

        uint256 distributable = r.totalCollected - fee;
        uint256 equalShare = distributable / winnersCount;

        address[] memory winners = new address[](winnersCount);
        uint256[] memory winningNums = new uint256[](winnersCount); 

        bool[] memory usedIndex = new bool[](pool.length);
        uint256 chosen = 0;
        uint256 nonce = 0;

        while (chosen < winnersCount) {
            uint256 randIdx = uint256(
                keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, nonce, raffleId))
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
            winningNums[chosen] = winningNumber; 
            
            r.winners.push(winnerAddr);
            r.winningNumbers.push(winningNumber);

            require(cUSD.transfer(winnerAddr, equalShare), "pay-failed");

            chosen++;
            nonce++;
        }

        r.closed = true;

        emit RaffleClosed(raffleId, winners, winningNums, distributable);
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
    // WITHDRAW PLATFORM FEES
    // ---------------------------------------------------------
    function withdrawPlatformFees(address to) external onlyOwner nonReentrant {
        require(to != address(0), "invalid address");
        uint256 amount = accumulatedFees;
        require(amount > 0, "no fees");

        accumulatedFees = 0;
        require(cUSD.transfer(to, amount), "withdraw-failed");

        emit PlatformFeesWithdrawn(to, amount);
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    /**
     * @notice Get user's selected numbers for a raffle
     * @param raffleId The raffle ID
     * @param user The user address
     * @return Array of numbers the user selected
     */
    function getUserSelectedNumbers(uint256 raffleId, address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userSelectedNumbers[raffleId][user];
    }

    /**
     * @notice Get winning numbers for a raffle
     * @param raffleId The raffle ID
     * @return Array of winning numbers
     */
    function getWinningNumbers(uint256 raffleId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return raffles[raffleId].winningNumbers;
    }

    /**
     * @notice Get complete winner information with their winning numbers
     * @param raffleId The raffle ID
     * @return Array of WinnerInfo structs containing address, numbers, and amount won
     */
    function getWinnersWithNumbers(uint256 raffleId) 
        external 
        view 
        returns (WinnerInfo[] memory) 
    {
        Raffle storage r = raffles[raffleId];
        require(r.closed, "raffle not closed");
        
        uint256[] memory winningNums = r.winningNumbers;
        address[] memory winners = r.winners;
        
        // Calculate equal share
        uint256 fee = (r.totalCollected * FEE_BASIS_POINTS) / 10000;
        uint256 distributable = r.totalCollected - fee;
        uint256 equalShare = winners.length > 0 ? distributable / winners.length : 0;
        
        // Group winners by address to handle multiple wins
        WinnerInfo[] memory result = new WinnerInfo[](winners.length);
        uint256 resultCount = 0;
        
        // Simple approach: return one entry per winning number
        // (Frontend can group by address if needed)
        for (uint256 i = 0; i < winners.length; i++) {
            uint256[] memory nums = new uint256[](1);
            nums[0] = winningNums[i];
            
            result[resultCount] = WinnerInfo({
                winnerAddress: winners[i],
                winningNumbers: nums,
                amountWon: equalShare
            });
            resultCount++;
        }
        
        return result;
    }

    /**
     * @notice Check if a user won a specific raffle
     * @param raffleId The raffle ID
     * @param user The user address
     * @return True if user won, false otherwise
     */
    function didUserWin(uint256 raffleId, address user) 
        external 
        view 
        returns (bool) 
    {
        address[] memory winners = raffles[raffleId].winners;
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] == user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get user's winning numbers (if they won)
     * @param raffleId The raffle ID
     * @param user The user address
     * @return Array of winning numbers for this user
     */
    function getUserWinningNumbers(uint256 raffleId, address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        Raffle storage r = raffles[raffleId];
        require(r.closed, "raffle not closed");
        
        // Count how many times user won
        uint256 winCount = 0;
        for (uint256 i = 0; i < r.winners.length; i++) {
            if (r.winners[i] == user) {
                winCount++;
            }
        }
        
        if (winCount == 0) {
            return new uint256[](0);
        }
        
        // Collect winning numbers
        uint256[] memory userWinningNums = new uint256[](winCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < r.winners.length; i++) {
            if (r.winners[i] == user) {
                userWinningNums[index] = r.winningNumbers[i];
                index++;
            }
        }
        
        return userWinningNums;
    }

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