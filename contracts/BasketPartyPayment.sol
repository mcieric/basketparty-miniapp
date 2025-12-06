// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BasketPartyPayment is Ownable {
    IERC20 public usdcToken;
    uint256 public gamePrice = 0.1 * 10**6; // 0.1 USDC (6 decimals)
    address public treasury;

    event GamePaid(address indexed player, uint256 amount, uint256 timestamp);
    event PriceUpdated(uint256 newPrice);

    constructor(address _usdcToken, address _treasury) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
    }

    function play() external {
        require(usdcToken.transferFrom(msg.sender, treasury, gamePrice), "Payment failed");
        emit GamePaid(msg.sender, gamePrice, block.timestamp);
    }

    function setGamePrice(uint256 _price) external onlyOwner {
        gamePrice = _price;
        emit PriceUpdated(_price);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
