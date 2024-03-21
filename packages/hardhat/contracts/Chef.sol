//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// Useful for debugging. Remove when deploying to a live network.
//import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IERC20 {
	function mint(address to, uint256 amount) external;

	function burn(address to, uint256 amount) external;
}

/**
 * A smart contract that allows to convert ingredients tokens into another token
 * @author BuidlGuidl
 */
contract Chef is AccessControl {
	bytes32 public constant ADD_RECIPES_ROLE = keccak256("ADD_RECIPES_ROLE");

	struct Ingredient {
		address tokenAddress;
		uint8 quantity;
	}

	struct Recipe {
		// uint256 cookTime;
		Ingredient[] ingredients;
	}

	struct RecipeData {
		address tokenAddress;
		Recipe recipe;
	}

	mapping(address => Recipe) recipes;
	address[] public recipesAddresses;

	address public creditToken;

	mapping(address => bool) rawTokenAddresses;

	constructor(address _creditToken, address[] memory rawTokenAddrs) {
		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
		_setupRole(ADD_RECIPES_ROLE, msg.sender);
		creditToken = _creditToken;

		for (uint256 i = 0; i < rawTokenAddrs.length; i++) {
			rawTokenAddresses[rawTokenAddrs[i]] = true;
		}
	}

	function transferOwnership(
		address newOwner
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		require(
			!hasRole(DEFAULT_ADMIN_ROLE, newOwner),
			"Ownable: new owner already have admin role"
		);

		grantRole(DEFAULT_ADMIN_ROLE, newOwner);
		renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
	}

	function addRecipe(
		address recipeAddress,
		Recipe memory recipe
	) public onlyRole(ADD_RECIPES_ROLE) {
		for (uint256 i = 0; i < recipe.ingredients.length; i++) {
			Ingredient memory ingredient = recipe.ingredients[i];
			recipes[recipeAddress].ingredients.push(ingredient);
		}
		recipesAddresses.push(recipeAddress);
	}

	function addIngredient(
		address recipeAddress,
		address tokenAddress,
		uint8 quantity
	) public onlyRole(ADD_RECIPES_ROLE) {
		recipes[recipeAddress].ingredients.push(
			Ingredient(tokenAddress, quantity)
		);
	}

	function cook(address _recipe) public {
		require(recipes[_recipe].ingredients.length > 0, "Invalid recipe");
		Recipe storage recipe = recipes[_recipe];
		for (uint256 i = 0; i < recipe.ingredients.length; i++) {
			Ingredient storage ingredient = recipe.ingredients[i];
			IERC20 token = IERC20(ingredient.tokenAddress);
			token.burn(msg.sender, ingredient.quantity * 1 ether);
		}
		IERC20 recipeToken = IERC20(_recipe);
		recipeToken.mint(msg.sender, 1 ether);
	}

	function getRecipe(address _recipe) public view returns (Recipe memory) {
		return recipes[_recipe];
	}

	function getRecipes() public view returns (RecipeData[] memory) {
		RecipeData[] memory _recipes = new RecipeData[](
			recipesAddresses.length
		);
		for (uint256 i = 0; i < recipesAddresses.length; i++) {
			_recipes[i].tokenAddress = recipesAddresses[i];
			_recipes[i].recipe = recipes[recipesAddresses[i]];
		}
		return _recipes;
	}
}
