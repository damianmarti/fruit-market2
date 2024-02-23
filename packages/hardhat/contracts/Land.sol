//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// Useful for debugging. Remove when deploying to a live network.
//import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
	function mint(address to, uint256 amount) external;

	function transferFrom(
		address sender,
		address receiver,
		uint256 amount
	) external returns (bool);
}

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract Land {
	uint256 public constant GROW_PERIOD = 1 minutes;
	uint256 public constant ROTTEN_PERIOD = 1 minutes;
	bool public constant ALLOW_TO_CHANGE_FARM = false;
	uint256 public constant MAX_TILES = 10;
	uint256 public constant LAND_PRICE = 10 ether;
	uint256 public constant CHANGE_FARM_PRICE = 5 ether;

	enum Sprites {
		Grass,
		House,
		Busy
	}

	struct Tile {
		Sprites sprite;
		address owner;
		uint256 lastHarvest;
		uint256 currentTaxRate;
		address tokenAddress;
	}

	Tile[10] public tiles;

	address public strawberryAddress;
	address public creditToken;

	mapping(address => bool) tokenAddresses;

	constructor(address _creditToken, address[] memory tokenAddrs) {
		creditToken = _creditToken;

		Tile memory startingTile = Tile({
			sprite: Sprites.Grass,
			owner: address(0),
			lastHarvest: 0,
			currentTaxRate: 0,
			tokenAddress: address(0)
		});
		for (uint256 i = 0; i < 10; i++) {
			tiles[i] = startingTile;
		}

		for (uint256 i = 0; i < tokenAddrs.length; i++) {
			tokenAddresses[tokenAddrs[i]] = true;
		}
	}

	function getMap() public view returns (Tile[10] memory) {
		return tiles;
	}

	function claim(uint256 _tile) public {
		require(tiles[_tile].owner == address(0), "Tile already claimed");
		tiles[_tile].owner = msg.sender;
		tiles[_tile].sprite = Sprites.House;
		IERC20 credit = IERC20(creditToken);
		credit.transferFrom(msg.sender, address(this), 10 ether);
	}

	function farm(uint256 _tile, address tokenAddress) public {
		require(tiles[_tile].owner == msg.sender, "You don't own this tile");
		require(tiles[_tile].sprite == Sprites.House, "You can't farm here");
		require(tokenAddresses[tokenAddress], "Invalid token address");
		tiles[_tile].sprite = Sprites.Busy;
		tiles[_tile].lastHarvest = block.timestamp;
		tiles[_tile].tokenAddress = tokenAddress;
	}

	function canHarvestAll() public view returns (bool[] memory) {
		bool[] memory canHarvestAllResult = new bool[](10);
		for (uint256 i = 0; i < 10; i++) {
			canHarvestAllResult[i] = canHarvest(i);
		}
		return canHarvestAllResult;
	}

	function rottenAll() public view returns (bool[] memory) {
		bool[] memory rottenAllResult = new bool[](10);
		for (uint256 i = 0; i < 10; i++) {
			rottenAllResult[i] = rotten(i);
		}
		return rottenAllResult;
	}

	function canHarvest(uint256 _tile) public view returns (bool) {
		return block.timestamp - tiles[_tile].lastHarvest > GROW_PERIOD;
	}

	function rotten(uint256 _tile) public view returns (bool) {
		return
			block.timestamp - tiles[_tile].lastHarvest >
			(GROW_PERIOD + ROTTEN_PERIOD);
	}

	function harvest(uint256 _tile) public {
		require(tiles[_tile].owner == msg.sender, "You don't own this tile");
		require(
			tiles[_tile].sprite == Sprites.Busy,
			"Nothing planted here yet"
		);
		require(canHarvest(_tile), "Not ready to harvest yet");
		require(!rotten(_tile), "Rotten strawberry!");
		tiles[_tile].lastHarvest = block.timestamp;
		IERC20 token = IERC20(tiles[_tile].tokenAddress);
		token.mint(msg.sender, 5 ether);
	}

	function farmAgain(uint256 _tile) public {
		require(tiles[_tile].owner == msg.sender, "You don't own this tile");
		require(tiles[_tile].sprite == Sprites.Busy, "Nothing planted");
		require(rotten(_tile), "Not rotten yet");
		tiles[_tile].lastHarvest = block.timestamp;
	}

	function changeFarm(uint256 _tile, address tokenAddress) public {
		require(tiles[_tile].owner == msg.sender, "You don't own this tile");
		require(ALLOW_TO_CHANGE_FARM, "Not allowed to change farm");
		require(tokenAddresses[tokenAddress], "Invalid token address");
		IERC20 credit = IERC20(creditToken);
		credit.transferFrom(msg.sender, address(this), CHANGE_FARM_PRICE);
		tiles[_tile].tokenAddress = tokenAddress;
		tiles[_tile].lastHarvest = block.timestamp;
	}
}
