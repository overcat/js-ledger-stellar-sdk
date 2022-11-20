import type Transport from "@ledgerhq/hw-transport";
import { base32 } from "@scure/base";
import crc from "crc";

/**
 * @typedef {object} Signature
 * @property {Buffer} signature - The signature
 */

/**
 * @typedef {object} PublicKey
 * @property {string} publicKey - Encoded public key
 * @property {Buffer} rawPublicKey - Raw public key
 */

/**
 * @typedef {object} AppConfiguration
 * @property {string} version - The version of the Stellar app installed on the device
 * @property {boolean} hashSigningEnabled - Whether hash signing is enabled
 */

/**
 * Ledger Hardware Wallet Stellar JavaScript bindings.
 */
export default class Stellar {
  private transport: Transport;

  /**
   * @param {Transport} transport - The Ledger transport to use
   * @param {string} [scrambleKey=w0w] - A string that will be used to scramble the device communication
   * @example
   * ```typescript
   * import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
   * import LedgerStellarApi from "@ledgerhq/hw-app-stellar";
   *
   * const transport = await TransportWebUSB.create();
   * const stellar = new LedgerStellarApi(transport);
   * ```
   */
  constructor(transport: Transport, scrambleKey = "w0w") {
    this.transport = transport;
    transport.decorateAppAPIMethods(
      this,
      ["getPublicKey", "signTransaction", "signHash", "getAppConfiguration"],
      scrambleKey
    );
  }

  /**
   * Get Stellar public key for a given account index.
   *
   * @param {number} accountIndex - It is part of key derivation path: `m/44'/148'/accountIndex'`
   * @param {boolean} [boolDisplay] - If set to "true", the public key will be displayed on the Ledger device and the user will be asked to confirm, otherwise it will not
   * @returns {PublicKey} an object with a publicKey and rawPublicKey.
   * @example
   * ```typescript
   * const response = stellar.getPublicKey(0, true)
   * ```
   */
  async getPublicKey(
    accountIndex: number,
    boolDisplay?: boolean
  ): Promise<{
    publicKey: string;
    rawPublicKey: Buffer;
  }> {
    const paths = getStellarPath(accountIndex);
    const buffer = Buffer.alloc(1 + paths.length * 4);
    buffer[0] = paths.length;
    paths.forEach((element, index) => {
      buffer.writeUInt32BE(element, 1 + 4 * index);
    });
    const response = await this.transport.send(0xe0, 0x02, 0x00, boolDisplay ? 0x01 : 0x00, buffer);
    const rawPublicKey = response.subarray(0, 32);
    const publicKey = encodeEd25519PublicKey(rawPublicKey);
    return { publicKey, rawPublicKey };
  }

  /**
   * Sign the given transaction.
   *
   * @param {number} accountIndex - It is part of key derivation path: `m/44'/148'/accountIndex'`
   * @param {Buffer} transaction - The transaction to sign. It consists of network id and transaction envelope, if you are using `stellar-sdk`, you can use `transaction.signatureBase()` to get the value
   * @returns {Signature} the signature
   */
  async signTransaction(
    accountIndex: number,
    transaction: Buffer
  ): Promise<{
    signature: Buffer;
  }> {
    const paths = getStellarPath(accountIndex);
    let response: Buffer | undefined;
    let offset = 0;
    while (offset !== transaction.length) {
      const isFirstChunk = offset === 0;
      const maxChunkSize = isFirstChunk ? 150 - 1 - paths.length * 4 : 150;
      const chunkSize =
        offset + maxChunkSize > transaction.length ? transaction.length - offset : maxChunkSize;
      const buffer = Buffer.alloc(isFirstChunk ? 1 + paths.length * 4 + chunkSize : chunkSize);
      if (isFirstChunk) {
        buffer[0] = paths.length;
        paths.forEach((element, index) => {
          buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        transaction.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
      } else {
        transaction.copy(buffer, 0, offset, offset + chunkSize);
      }
      const isLastChunk = offset + chunkSize === transaction.length;
      response = await this.transport.send(
        0xe0,
        0x04,
        isFirstChunk ? 0x00 : 0x80,
        isLastChunk ? 0x00 : 0x80,
        buffer
      );
      offset += chunkSize;
    }

    if (!response) {
      throw new Error("response is empty");
    }

    const signature = response.subarray(0, 64);
    return { signature };
  }

  /**
   * Sign the given hash.
   *
   * It is intended for signing transactions not supported by the Ledger Stellar
   * app and should be avoided as much as possible.
   *
   * @param {number} accountIndex - It is part of key derivation path: `m/44'/148'/accountIndex'`
   * @param {string|Buffer} hash - The hash to sign
   * @returns {Signature} the signature
   * @example
   * ```typescript
   * const response = stellar.signHash(0, "4b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd")
   * ```
   */
  async signHash(
    accountIndex: number,
    hash: Buffer | string
  ): Promise<{
    signature: Buffer;
  }> {
    if (typeof hash === "string") {
      hash = Buffer.from(hash.startsWith("0x") ? hash.slice(2) : hash, "hex");
    }
    if (Buffer.byteLength(hash) !== 32) {
      throw new Error("hash must be 32 bytes");
    }
    const paths = getStellarPath(accountIndex);
    const buffer = Buffer.alloc(1 + paths.length * 4 + 32);
    buffer[0] = paths.length;
    paths.forEach((element, index) => {
      buffer.writeUInt32BE(element, 1 + 4 * index);
    });
    const offset = 1 + 4 * paths.length;
    hash.copy(buffer, offset);
    const response = await this.transport.send(0xe0, 0x08, 0x00, 0x00, buffer);
    const signature = response.subarray(0, 64);
    return { signature };
  }

  /**
   * Get the configuration of the Ledger Stellar app installed on the hardware device.
   *
   * @returns {AppConfiguration} an object with the version and the flag to indicate whether hash signing is enabled
   * @example
   * ```typescript
   * const response = await stellar.getAppConfiguration();
   * ```
   */
  async getAppConfiguration(): Promise<{
    readonly version: string;
    readonly hashSigningEnabled: boolean;
  }> {
    const response = await this.transport.send(0xe0, 0x06, 0x00, 0x00);
    const hashSigningEnabled = response[0] === 1;
    const version = `${response[1]}.${response[2]}.${response[3]}`;
    return { version, hashSigningEnabled };
  }
}

/**
 * Build a Stellar path.
 *
 * @private
 * @param {number} accountIndex - It is part of key derivation path: `m/44'/148'/accountIndex'`
 * @returns {Array<number>} the path
 */
function getStellarPath(accountIndex: number) {
  if (accountIndex < 0 || accountIndex > 2 ** 32 - 1) {
    throw new Error("Invalid account index");
  }
  const initValue = 0x80000000;
  return [initValue + 44, initValue + 148, initValue + accountIndex];
}

/**
 * Computes the CRC16-XModem checksum of `payload` in little-endian order.
 *
 * @private
 * @param {Buffer} payload - The payload to checksum
 * @returns {Buffer} the checksum
 */
function calculateChecksum(payload: Buffer): Buffer {
  const checksum = Buffer.alloc(2);
  checksum.writeUInt16LE(crc.crc16xmodem(payload), 0);
  return checksum;
}

/**
 * Encode a raw public key to a Stellar public key.
 *
 * @private
 * @param {Buffer} data - The raw public key
 * @returns {string} the Stellar public key
 */
function encodeEd25519PublicKey(data: Buffer): string {
  const versionByte = 6 << 3; // G (when encoded in base32)
  const versionBuffer = Buffer.from([versionByte]);
  const payload = Buffer.concat([versionBuffer, data]);
  const checksum = calculateChecksum(payload);
  const unencoded = Buffer.concat([payload, checksum]);
  return base32.encode(unencoded);
}
