// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Y8uERC20 is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * (10 ** uint256(18));

    constructor(address initialOwner)
        ERC20("TestYou", "YOOU")
        Ownable(initialOwner)
    {}

    // amount in wei to mint
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY,"Can't mint more than the entire supply");
        _mint(to, amount);
    }


}