/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

const Ae = require('@aeternity/aepp-sdk').Universal;
const Node = require('@aeternity/aepp-sdk').Node;
const Deployer = require('aeproject-lib').Deployer;
const EXAMPLE_CONTRACT_PATH = "./contracts/Franchesca.aes";

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    compilerUrl: "http://localhost:3080"
};

describe('Franchesca Contract', () => {

    let deployer;
    let instance;
    let employeeClient;
    let ownerKeyPair = wallets[0];
    let patronKeyPair = wallets[1];
    let employeeKeyPair = wallets[2];
    let employeeParams =
        [employeeKeyPair.publicKey,
         'Francisca',
         'Ruiz',
         35463345,
         35000,
         12];

    before(async () => {
        deployer = new Deployer('local', ownerKeyPair.secretKey)
        const node = await Node({ url: config.host })

        employeeClient = await Ae({
            url: config.host,
            nodes: [{ name: 'local', instance: node }],
            internalUrl: config.internalHost,
            compilerUrl: config.compilerUrl,
            keypair: employeeKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet'
        });

        patronClient = await Ae({
            url: config.host,
            nodes: [{ name: 'local', instance: node }],
            internalUrl: config.internalHost,
            compilerUrl: config.compilerUrl,
            keypair: patronKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet'
        });
    })

    it('Deploying Franchesca Contract', async () => {
        deployedContractOwner = await deployer.deploy(EXAMPLE_CONTRACT_PATH, employeeParams);

        deployedContractPatron = await deployedContractOwner.from(patronKeyPair.secretKey);
        deployedContractEmployee = await deployedContractOwner.from(employeeKeyPair.secretKey);

        await assert.isOk(deployedContractOwner, 'Could not deploy Franchesca Contract');

        instance = deployedContractOwner
    });

    it('Should add funds to contract balance', async() => {
        patron = patronKeyPair.publicKey;

        await deployedContractPatron.add_funds({amount: 300000});
        balance = (await instance.get_balance()).decodedResult
        console.log('Initial balance:', total_funds);

        assert.equal(balance, 300000, 'Contract was succesfully funded');
    });

    it('Franchesca should check_in to work and change is_working state to true', async () => {
        await instance.check_in();
        is_working = (await instance.is_working()).decodedResult;
        assert.isTrue(is_working, 'Franchesca started to work');
    });

    it('Contract should register the work day after franchescas check_in', async () => {
        let current_height = (await instance.current_height()).decodedResult;
        let work = (await instance.work()).decodedResult;
        assert.hasAllKeys(work, ['start', 'end'], 'Franchesca Started her work_day')
        assert(work.start >= 0, 'Franchesca Started to work at' + work.start)
    });

    it('Franchesca should check_out from work and change is_working state to false', async () => {
        await instance.check_out();
        is_working = (await instance.is_working()).decodedResult;
        assert.isFalse(is_working, 'Franchesca finished work');
    });

    it('Franchesca works whole week and get paid', async () => {
        let week_days = 3;
        let calculated_salary = employeeParams[4] * 1.285 * week_days;
        console.log("Calculated salary:", calculated_salary);

        while (week_days != 0 ) {

            await instance.check_in();
            await instance.check_out();

            console.log("Franchesca completed a work_day");
            week_days --;
        }

        await instance.pay();
        duration = (await instance.current_duration()).decodedResult;
        console.log("Current duration:", duration);

        let ct_total_paid = (await instance.total_paid()).decodedResult;
        console.log("Contract paid:", ct_total_paid);

        let total_worked_days = (await instance.total_worked_days()).decodedResult;
        console.log("Total worked days", total_worked_days);

        total_funds = (await instance.get_balance()).decodedResult;

        assert.equal(calculated_salary, ct_total_paid, 'Franchesca recieved ' . ct_total_paid);
    });

    it('Should get contract balance after payment', async() => {
        balance = (await instance.get_balance()).decodedResult
        console.log('Remainging balance:', total_funds);

        assert.equal(balance, 165075, 'Francisca was succesfully paid');
    });

});
