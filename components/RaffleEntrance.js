// Have a function enter the Raffle
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"

export default function RaffleEntrance() {
    // We're pulling out the chainId object and renaming it to chainIdHex
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    // chainId gives us the hex id of the chain ID, so we do this (parseInt(chainIdHex))
    const chainId = parseInt(chainIdHex)
    // If chainId is in our contractAddresses file, set raffleAddress to it at spot 0, otherwise null
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    // useState hook, entranceFee is our value, whenever this setEntranceFee() function is called it will trigger a re render from the front end. "0" is a starting value
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setrecentWinner] = useState("0")

    const dispatch = useNotification()

    // Calling the enterRaffle function tied to our Enter Raffle button onClick
    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    // Getting the entrance fee for our enterRaffle function call, isLoading, isFetching - We will disable our button
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    // try to read the raffle state
    async function updateUI() {
        const entranceFee = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        // This will set the useState and trigger a re-render for our entranceFee variable
        setEntranceFee(entranceFee)
        setNumPlayers(numPlayersFromCall)
        setrecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])
    // isWeb3Enabled starts as false right after a refresh, then the browser checks the local storage and sees it should be enabled and sets it to true

    // When we press our Enter Raffle button and it's sucessful, it will call this handleSuccess function that takes a transaction, then call the handleNewNotification and dispatch/launch a notification
    // onSuccess only checks that the transaction was successfully sent to metamask, it does now wait for a block confirmation
    // This is why we include await tx.wait(1), because that is the piece that actually waits for the transaction to be confirmed
    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-0 font-bold text-3xl">Raffle!</h1>
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>The current number of players is: {numPlayers}</div>
                    <div>The most previous winner was: {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    )
}
