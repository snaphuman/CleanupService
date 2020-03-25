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
    let employeeKeyPair = wallets[1];
    let employeeParams =
        ['ak_286tvbfP6xe4GY9sEbuN2ftx1LpavQwFVcPor9H4GxBtq5fXws',
         'Francisca',
         'Ruiz',
         '35463345',
         35000,
         6];

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
    })

    it('Deploying Franchesca Contract', async () => {
        deployedContractOwner = await deployer.deploy(EXAMPLE_CONTRACT_PATH, employeeParams);

        deployedContractEmployee = await deployedContractOwner.from(employeeKeyPair.secretKey);

        await assert.isOk(deployedContractOwner, 'Could not deploy Franchesca Contract');

        instance = deployedContractOwner
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

})
