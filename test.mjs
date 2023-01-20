import { create } from 'ipfs-http-client'
const ipfs = create()


async function createOrderNode(stockName, price, quantity, status) {
    // Create the DAG node
    const node = {
        stockName,
        price,
        quantity,
        status
    }
    const cid = await ipfs.dag.put(node)
    console.log(cid)
    return cid
}
async function publishOrder(cid, stockName, status) {
    await ipfs.pubsub.publish(`${stockName}${status}`, cid.bytes)
    
}

async function subscribeOrder(stockName, status) {
    // Subscribe to the opposite status
    const oppStatus = status === 'buy' ? 'sell' : 'buy'
    ipfs.pubsub.subscribe(`${stockName}${oppStatus}`, async msg => {
        console.log('hello')
        console.log(msg)
        const matchedBuyNode = await ipfs.dag.get(msg.data)
        const matchedSellNode = await ipfs.dag.get(cid.bytes)
        console.log("Matched Orders:", matchedBuyNode.value, matchedSellNode.value)
        // Remove the matched orders from the DAG
        await ipfs.dag.remove(msg.data)
        await ipfs.dag.remove(cid.bytes)
    }).catch(err => {
        console.error(err);
    });
  
}

async function main() {
    const cid = await createOrderNode("TEST", 500, 100, "buy")
    await publishOrder(cid, "TEST", "buy")
    await subscribeOrder("TEST", "sell")
}


main()