import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()

    useEffect(() => {
        // If we are already connect to Web 3, then do nothing
        if (isWeb3Enabled) return
        // If the window object exists
        if (typeof window !== "undefined") {
            // If the connected key exists in our local storage, then run enableWeb3()
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])
    // no array, run on every render
    // empty array, run once
    // dependency array, run when the stuff in it changes

    useEffect(() => {
        // onAccountChanged takes a function as an imput parameter
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            // If account == null we can assume they disconnected, then remove the connected item
            if (account == null) {
                window.localStorage.removeItem("connected")
                // This will set isWeb3Enabled() to false
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    }, [])

    return (
        <div>
            {account ? (
                <div>Connected to {account}</div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected") // Stored in our browser to tell we are connected
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}

// I'm going to show you the hard way first
// Then the easy way
