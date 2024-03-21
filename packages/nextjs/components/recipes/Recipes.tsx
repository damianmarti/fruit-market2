import React, { useState } from "react";
import { useWalletClient } from "wagmi";
import { useScaffoldContract, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { TTokenInfo } from "~~/types/wallet";
import { notification } from "~~/utils/scaffold-eth";

/**
 * Site footer
 */
export const Recipes = ({ tokensByAddress }: { tokensByAddress: { [key: string]: TTokenInfo } }) => {
  const [isCooking, setIsCooking] = useState(false);

  const { data: walletClient } = useWalletClient();
  const { data: chefContract } = useScaffoldContract({
    contractName: "Chef",
    walletClient,
  });

  const { data: recipes } = useScaffoldContractRead({
    contractName: "Chef",
    functionName: "getRecipes",
  });

  const cook = async (recipeAddress: string) => {
    try {
      setIsCooking(true);
      await chefContract?.write.cook([recipeAddress]);
      const token = tokensByAddress[recipeAddress];
      notification.success(`${token.emoji} ${token.name} Ready!`);
    } catch (e) {
      notification.error("Not enough ingredients");
    } finally {
      setIsCooking(false);
    }
  };

  return (
    <>
      <div className="w-full mb-2 mt-4 text-center">
        <h2 className="text-2xl font-bold">Recipes</h2>
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipeData: any, index: number) => {
              return (
                <div key={index} className="bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between">
                  <h3 className="text-xl font-bold">
                    {tokensByAddress[recipeData.tokenAddress].emoji} {tokensByAddress[recipeData.tokenAddress].name}
                  </h3>
                  <div className="mt-6 text-left">
                    <ul>
                      {recipeData.recipe.ingredients.map((ingredient: any, index: number) => {
                        return (
                          <li key={index}>
                            {ingredient.quantity} {tokensByAddress[ingredient.tokenAddress].emoji}{" "}
                            {tokensByAddress[ingredient.tokenAddress].name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div>
                    <button
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      disabled={isCooking}
                      onClick={async () => {
                        console.log("recipeData: ", recipeData);
                        await cook(recipeData.tokenAddress);
                      }}
                    >
                      Craft
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No recipes found</p>
        )}
      </div>
    </>
  );
};
