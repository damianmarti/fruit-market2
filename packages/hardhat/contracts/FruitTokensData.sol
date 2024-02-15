// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
	function balanceOf(address user) external view returns (uint256);
}

interface IBasicDex {
	function assetOutPrice(uint256 assetOut) external view returns (uint256);

	function assetInPrice(uint256 assetIn) external view returns (uint256);
}

contract FruitTokensData {
	function balancesOf(
		address user,
		address[] calldata tokenAddrs
	) public view returns (uint256[] memory) {
		uint256 tokenAddrsLen = tokenAddrs.length;
		uint256[] memory balances = new uint256[](tokenAddrsLen);

		for (uint256 i; i < tokenAddrsLen; ++i) {
			uint256 balance = IERC20(tokenAddrs[i]).balanceOf(user);
			balances[i] = balance;
		}

		return balances;
	}

	function assetOutPrices(
		address[] calldata dexAddrs
	) public view returns (uint256[] memory) {
		uint256 dexAddrsLen = dexAddrs.length;
		uint256[] memory prices = new uint256[](dexAddrsLen);

		for (uint256 i; i < dexAddrsLen; ++i) {
			uint256 assetPrice = IBasicDex(dexAddrs[i]).assetOutPrice(1 ether);
			prices[i] = assetPrice;
		}

		return prices;
	}

	function assetInPrices(
		address[] calldata dexAddrs
	) public view returns (uint256[] memory) {
		uint256 dexAddrsLen = dexAddrs.length;
		uint256[] memory prices = new uint256[](dexAddrsLen);

		for (uint256 i; i < dexAddrsLen; ++i) {
			uint256 assetPrice = IBasicDex(dexAddrs[i]).assetInPrice(1 ether);
			prices[i] = assetPrice;
		}

		return prices;
	}
}
