import { openTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";
import {
  Operation,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Account,
  Keypair,
  StrKey
} from "stellar-base";
import Stellar from "../../src/index";

describe("Stellar", () => {
  describe("getAppConfiguration", () => {
    test("hash signing enabled", async () => {
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e006000000
        <= 010402039000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.getAppConfiguration();
      expect(result).toEqual({ hashSigningEnabled: true, version: "4.2.3" });
    });

    test("hash signing not enabled", async () => {
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e006000000
        <= 000402039000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.getAppConfiguration();
      expect(result).toEqual({ hashSigningEnabled: false, version: "4.2.3" });
    });
  });

  describe("getPublicKey", () => {
    test("accountId = 0, not display", async () => {
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00200000d038000002c8000009480000000
        <= e93388bbfd2fbd11806dd0bd59cea9079e7cc70ce7b1e154f114cdfe4e466ecd9000
        `)
      );
      const expectPublicKey = "GDUTHCF37UX32EMANXIL2WOOVEDZ47GHBTT3DYKU6EKM37SOIZXM2FN7";
      const stellar = new Stellar(transport);
      const result = await stellar.getPublicKey(0);
      expect(result).toEqual({
        publicKey: expectPublicKey,
        rawPublicKey: StrKey.decodeEd25519PublicKey(expectPublicKey)
      });
    });

    test("accountId = 0, display", async () => {
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00200010d038000002c8000009480000000
        <= e93388bbfd2fbd11806dd0bd59cea9079e7cc70ce7b1e154f114cdfe4e466ecd9000
        `)
      );
      const expectPublicKey = "GDUTHCF37UX32EMANXIL2WOOVEDZ47GHBTT3DYKU6EKM37SOIZXM2FN7";
      const stellar = new Stellar(transport);
      const result = await stellar.getPublicKey(0, true);
      expect(result).toEqual({
        publicKey: expectPublicKey,
        rawPublicKey: StrKey.decodeEd25519PublicKey(expectPublicKey)
      });
    });

    test("accountId = 4096, not display", async () => {
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00200000d038000002c8000009480001000
        <= cf9563be9492e0499894834196a852fc2143567b5e5d0ef26e61def355f8607a9000
        `)
      );
      const expectPublicKey = "GDHZKY56SSJOASMYSSBUDFVIKL6CCQ2WPNPF2DXSNZQ5542V7BQHVZIL";
      const stellar = new Stellar(transport);
      const result = await stellar.getPublicKey(4096, false);
      expect(result).toEqual({
        publicKey: expectPublicKey,
        rawPublicKey: StrKey.decodeEd25519PublicKey(expectPublicKey)
      });
    });

    test("accountId = 4096, display", async () => {
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00200010d038000002c8000009480001000
        <= cf9563be9492e0499894834196a852fc2143567b5e5d0ef26e61def355f8607a9000
        `)
      );
      const expectPublicKey = "GDHZKY56SSJOASMYSSBUDFVIKL6CCQ2WPNPF2DXSNZQ5542V7BQHVZIL";
      const stellar = new Stellar(transport);
      const result = await stellar.getPublicKey(4096, true);
      expect(result).toEqual({
        publicKey: expectPublicKey,
        rawPublicKey: StrKey.decodeEd25519PublicKey(expectPublicKey)
      });
    });
  });

  describe("signHash", () => {
    test("buffer hash, accountId = 0", async () => {
      const hash = "4b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd";
      const expectSignature =
        "WLCaR4HoduZIMBZCOaZ4QJYUIknJXe2/28CXPAC2f2NuKXMeOG5Q05fQ3xW91uI3Qk8jE33HvLyODaYK1MCoDQ==";
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00800002d038000002c80000094800000004b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd
        <= 58b09a4781e876e64830164239a6784096142249c95dedbfdbc0973c00b67f636e29731e386e50d397d0df15bdd6e237424f23137dc7bcbc8e0da60ad4c0a80d9000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.signHash(0, Buffer.from(hash, "hex"));
      expect(result).toEqual({
        signature: Buffer.from(expectSignature, "base64")
      });
    });

    test("string hash without 0x, accountId = 0", async () => {
      const kp = Keypair.fromSecret("SAIYWGGWU2WMXYDSK33UBQBMBDKU4TTJVY3ZIFF24H2KQDR7RQW5KAEK");
      const hash = "4b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd";
      const expectSignature = kp.sign(Buffer.from(hash, "hex"));
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00800002d038000002c80000094800000004b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd
        <= 58b09a4781e876e64830164239a6784096142249c95dedbfdbc0973c00b67f636e29731e386e50d397d0df15bdd6e237424f23137dc7bcbc8e0da60ad4c0a80d9000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.signHash(0, hash);
      expect(result).toEqual({
        signature: expectSignature
      });
    });

    test("string hash with 0x, accountId = 0", async () => {
      const kp = Keypair.fromSecret("SAIYWGGWU2WMXYDSK33UBQBMBDKU4TTJVY3ZIFF24H2KQDR7RQW5KAEK");
      const hash = "4b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd";
      const expectSignature = kp.sign(Buffer.from(hash, "hex"));
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00800002d038000002c80000094800000004b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd
        <= 58b09a4781e876e64830164239a6784096142249c95dedbfdbc0973c00b67f636e29731e386e50d397d0df15bdd6e237424f23137dc7bcbc8e0da60ad4c0a80d9000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.signHash(0, `0x${hash}`);
      expect(result).toEqual({
        signature: expectSignature
      });
    });

    test("buffer hash, accountId = 4096", async () => {
      const kp = Keypair.fromSecret("SB7LNJMMBPXUA52FU7BUQKMQXEVMGNBNE67NBRYRLGD26LZ2GRJ46OEQ");
      const hash = "4b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd";
      const expectSignature = kp.sign(Buffer.from(hash, "hex"));
      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e00800002d038000002c80000094800010004b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd
        <= ac8b635e6f69d9ca467783b7346c69e62f79ffe9d451fc25e1f23db27377c47a2de4135d98b2740536bce26acca264dff1dce295d4bbfc631aa72752b537af059000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.signHash(4096, Buffer.from(hash, "hex"));
      expect(result).toEqual({
        signature: expectSignature
      });
    });
  });

  describe("signTransaction", () => {
    test("only one chunk, accountId = 0", async () => {
      const kp = Keypair.fromSecret("SAIYWGGWU2WMXYDSK33UBQBMBDKU4TTJVY3ZIFF24H2KQDR7RQW5KAEK");
      const account = new Account(kp.publicKey(), "103720918407102567");
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
        timebounds: {
          minTime: 0,
          maxTime: 1670818332
        }
      })
        .addOperation(
          Operation.bumpSequence({
            bumpTo: "1"
          })
        )
        .build();
      const txBuffer = transaction.signatureBase();
      expect(txBuffer.length).toBeLessThan(150 - 1 - 3 * 4); // max chunk size - 1 byte for path length - 3 * 4 bytes for path

      const transport = await openTransportReplayer(
        RecordStore.fromString(`
      => e004000091038000002c80000094800000007ac33997544e3175d266bd022439b22cdb16508c01163f26e5cb2a3e1045a9790000000200000000e93388bbfd2fbd11806dd0bd59cea9079e7cc70ce7b1e154f114cdfe4e466ecd0000006401707da0316ec068000000010000000000000000000000006396aa1c0000000000000001000000000000000b000000000000000100000000
      <= 76193c0fb9e69e4d24befb1b12ef0324e752fcd2c2ed8b9648e7e09c71c70c61febca582d1d030d0e9564b6029589901f95ae47a534e06143b22542bb4c311009000
      `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.signTransaction(0, txBuffer);
      expect(result).toEqual({
        signature: kp.sign(transaction.hash())
      });
    });

    test("only one chunk, accountId = 4096", async () => {
      const kp = Keypair.fromSecret("SB7LNJMMBPXUA52FU7BUQKMQXEVMGNBNE67NBRYRLGD26LZ2GRJ46OEQ");
      const account = new Account(kp.publicKey(), "103720918407102567");
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
        timebounds: {
          minTime: 0,
          maxTime: 1670818332
        }
      })
        .addOperation(
          Operation.bumpSequence({
            bumpTo: "1"
          })
        )
        .build();
      const txBuffer = transaction.signatureBase();
      expect(txBuffer.length).toBeLessThan(150 - 1 - 3 * 4); // max chunk size - 1 byte for path length - 3 * 4 bytes for path

      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e004000091038000002c80000094800010007ac33997544e3175d266bd022439b22cdb16508c01163f26e5cb2a3e1045a9790000000200000000cf9563be9492e0499894834196a852fc2143567b5e5d0ef26e61def355f8607a0000006401707da0316ec068000000010000000000000000000000006396aa1c0000000000000001000000000000000b000000000000000100000000
        <= f665d551d91a4f6b36d310e989992520491898ef83e605198199760fd70516c31b112cd9b94ddd92292834d13bdc9995182c18213ebf824bbd0a35aec97f720f9000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.signTransaction(4096, txBuffer);
      expect(result).toEqual({
        signature: kp.sign(transaction.hash())
      });
    });
    test("multiple chunks, accountId = 0", async () => {
      const kp = Keypair.fromSecret("SAIYWGGWU2WMXYDSK33UBQBMBDKU4TTJVY3ZIFF24H2KQDR7RQW5KAEK");
      const account = new Account(kp.publicKey(), "103720918407102567");
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
        timebounds: {
          minTime: 0,
          maxTime: 1670818332
        }
      })
        .addOperation(
          Operation.manageData({
            name: "hello-1",
            value: "abcdefghijklmnopqrstuvwxyz"
          })
        )
        .addOperation(
          Operation.manageData({
            name: "hello-2",
            value: "abcdefghijklmnopqrstuvwxyz"
          })
        )
        .addOperation(
          Operation.manageData({
            name: "hello-3",
            value: "abcdefghijklmnopqrstuvwxyz"
          })
        )
        .addOperation(
          Operation.manageData({
            name: "hello-4",
            value: "abcdefghijklmnopqrstuvwxyz"
          })
        )
        .addOperation(
          Operation.manageData({
            name: "hello-5",
            value: "abcdefghijklmnopqrstuvwxyz"
          })
        )
        .build();
      const txBuffer = transaction.signatureBase();
      expect(txBuffer.length).toBeGreaterThan(150 - 1 - 3 * 4); // max chunk size - 1 byte for path length - 3 * 4 bytes for path

      const transport = await openTransportReplayer(
        RecordStore.fromString(`
        => e004008096038000002c80000094800000007ac33997544e3175d266bd022439b22cdb16508c01163f26e5cb2a3e1045a9790000000200000000e93388bbfd2fbd11806dd0bd59cea9079e7cc70ce7b1e154f114cdfe4e466ecd000001f401707da0316ec068000000010000000000000000000000006396aa1c0000000000000005000000000000000a0000000768656c6c6f2d31000000000100
        <= 9000
        => e00480809600001a6162636465666768696a6b6c6d6e6f707172737475767778797a0000000000000000000a0000000768656c6c6f2d3200000000010000001a6162636465666768696a6b6c6d6e6f707172737475767778797a0000000000000000000a0000000768656c6c6f2d3300000000010000001a6162636465666768696a6b6c6d6e6f707172737475767778797a000000000000000000
        <= 9000
        => e00480006d0a0000000768656c6c6f2d3400000000010000001a6162636465666768696a6b6c6d6e6f707172737475767778797a0000000000000000000a0000000768656c6c6f2d3500000000010000001a6162636465666768696a6b6c6d6e6f707172737475767778797a000000000000
        <= 8462e913748d678ebdfa1bf7c93712c78f3f810bf1f9c26d1cf23bf55e1c0c63f7c00eeeb5889ff43302729673f631f7223d4613053ce029d8b7cf3ab81f31079000
        `)
      );
      const stellar = new Stellar(transport);
      const result = await stellar.signTransaction(0, txBuffer);
      expect(result).toEqual({
        signature: kp.sign(transaction.hash())
      });
    });
  });
});
