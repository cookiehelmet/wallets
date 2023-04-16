const jwt = require('jsonwebtoken')
const axios = require('axios').default
const { expect, assert } = require('chai')
const headersUser1 = { Authorization: 'Bearer 6YD3tFhTENnkwQn04ZD0NGiaqX0k7NlDnOT3xd11R0b0FkQYYZJ6jqBA6eq16x82' }
const headersUser2 = { Authorization: 'Bearer l9LVjxRo3LvLvj5x95fA1LFPQUC0WyTspE6lKhrYpWFBfj7OJcXSW2wB3A0yNEGl' }

describe('Wallet APIs', async () => {
  it('201 - Create a wallet and add funds', async () => {
    const createWallet = await axios.post('http://localhost:3000/wallets', { type: 'saving' }, { headers: headersUser1 })
    expect(createWallet.status).to.equal(201)
    expect(createWallet.data.id).to.be.a('string')
    expect(createWallet.data.type).to.equal('saving')
    expect(createWallet.data.balanceInMinorUnit).to.equal(0)

    const addFunds = await axios.post(`http://localhost:3000/wallets/${createWallet.data.id}/funds`, { amountInMinorUnit: 10000 }, { headers: headersUser1 })
    expect(addFunds.status).to.equal(201)
    expect(addFunds.data.type).to.equal('saving')
    expect(addFunds.data.balanceInMinorUnit).to.equal(10000)
  })

  it('400 - Create a wallet with invalid type', async () => {
    try {
      await axios.post('http://localhost:3000/wallets', { type: 'unknown' }, { headers: headersUser1 })
      assert.fail('Should not reach here')
    } catch (error) {
      expect(error.response.status).to.equal(400)
    }
  })

  it('200 - Get wallets', async () => {
    const getWallets = await axios.get('http://localhost:3000/wallets', { headers: headersUser1 })
    expect(getWallets.status).to.equal(200)
    expect(getWallets.data.length).to.be.greaterThanOrEqual(1)
    expect(getWallets.data[0].createdAt).to.be.a('string')
  })

  it('201 - Create a transaction from wallet A to wallet B', async () => {
    const { data: wallet1 } = await axios.post('http://localhost:3000/wallets', { type: 'saving' }, { headers: headersUser1 })
    const fromWalletId = wallet1.id

    const addFunds = await axios.post(`http://localhost:3000/wallets/${fromWalletId}/funds`, { amountInMinorUnit: 10000 }, { headers: headersUser1 })
    expect(addFunds.status).to.equal(201)

    const { data: wallet2 } = await axios.post('http://localhost:3000/wallets', { type: 'saving' }, { headers: headersUser2 })
    const toWalletId = wallet2.id

    const transaction = await axios.post('http://localhost:3000/transactions', {
      amountInMinorUnit: 500,
      fromWalletId,
      toWalletId
    }, { headers: headersUser1 })
    expect(transaction.status).to.equal(201)
    expect(transaction.data.fromWallet).to.equal(fromWalletId)
    expect(transaction.data.toWallet).to.equal(toWalletId)
    expect(transaction.data.amountInMinorUnit).to.equal(500)
    expect(transaction.data.type).to.equal('transfer')
  })

  it('201 - Sign a message', async () => {
    const createWallet = await axios.post('http://localhost:3000/wallets', { type: 'saving' }, { headers: headersUser1 })
    expect(createWallet.status).to.equal(201)

    const signMessage = await axios.post(`http://localhost:3000/wallets/${createWallet.data.id}/sign`, { message: 'hello world' }, { headers: headersUser1 })
    expect(signMessage.status).to.equal(201)
    expect(signMessage.data.token).to.be.a('string')

    // Verify signature
    const decoded = jwt.verify(signMessage.data.token, createWallet.data.id)
    expect(decoded.message).to.equal('hello world')
  })

  it('401 - Invalid auth', async () => {
    try {
      await axios.post('http://localhost:3000/wallets/832cf594-0dd2-4a4e-abf3-beb8ea04b300/sign',
        { message: 'hello world' },
        {
          headers: { Authorization: 'Bearer foobar' }
        }
      )
      assert.fail('Should not reach here')
    } catch (error) {
      expect(error.response.status).to.equal(401)
    }
  })

  it('404 - Attempt to sign for wallet but wallet not found', async () => {
    try {
      await axios.post('http://localhost:3000/wallets/832cf594-0dd2-4a4e-abf3-beb8ea04b300/sign', { message: 'hello world' }, { headers: headersUser1 })
      assert.fail('Should not reach here')
    } catch (error) {
      expect(error.response.status).to.equal(404)
    }
  })

  it('404 - Attempt to sign by others wallet', async () => {
    const createWallet = await axios.post('http://localhost:3000/wallets', { type: 'saving' }, { headers: headersUser1 })
    try {
      await axios.post(`http://localhost:3000/wallets/${createWallet.data.id}/sign`, { message: 'hello world' }, { headers: headersUser2 })
      assert.fail('Should not reach here')
    } catch (error) {
      expect(error.response.status).to.equal(404)
    }
  })
})
