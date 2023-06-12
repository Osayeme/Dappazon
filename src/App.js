import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'
import Seller from './components/Seller'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [dappazon, setDappazon] = useState(null)

  const [account, setAccount] = useState(null)

  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)

  const [item, setItem] = useState({})
  const [seller, setSeller] = useState({})
  const [toggle, setToggle] = useState(false)
  const [toggleSeller, setToggleSeller] = useState(false)

const togglePopSeller = () => {
    toggleSeller ? setToggleSeller(false) : setToggleSeller(true)
    console.log(toggleSeller)
}

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const dappazon = new ethers.Contract(config[network.chainId].dappazon.address, Dappazon, provider)
    setDappazon(dappazon)

    const items = []
    setSeller(await dappazon.sellers('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'))
    
    

    for (var i = 0; i < 9; i++) {
      const item = await dappazon.items(i)
      items.push(item)
    }
    console.log(await dappazon.items(1))
    const electronics = items.filter((item) => item.category === 'electronics')
    const clothing = items.filter((item) => item.category === 'clothing')
    const toys = items.filter((item) => item.category === 'toys')

    setElectronics(electronics)
    setClothing(clothing)
    setToys(toys)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <h2>Dappazon Best Sellers</h2>

      {electronics && clothing && toys && (
        <>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} dappazon={dappazon} togglePop={togglePop} seller= {seller} togglePopSeller={togglePopSeller}/>
      )}

      {toggleSeller && (
        <Seller seller={seller} togglePopSeller={togglePopSeller} /> )}
    </div>
  );
}

export default App;