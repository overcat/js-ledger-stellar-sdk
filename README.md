# JavaScript Ledger Stellar SDK

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/overcat/js-ledger-stellar-sdk/Main/main)
![npm](https://img.shields.io/npm/v/ledger-stellar-sdk)

Ledger Hardware Wallet Stellar JavaScript bindings.

## Installation

```bash
npm install ledger-stellar-sdk
```

## API Documentation
### Classes

<dl>
<dt><a href="#Stellar">Stellar</a></dt>
<dd><p>Ledger Hardware Wallet Stellar JavaScript bindings.</p>
</dd>
</dl>

### Constants

<dl>
<dt><a href="#HashSigningModeNotEnabledError">HashSigningModeNotEnabledError</a> : <code>object</code></dt>
<dd><p>This error is thrown when hash signing mode is not enabled.</p>
</dd>
<dt><a href="#UnknownStellarOperationTypeError">UnknownStellarOperationTypeError</a> : <code>object</code></dt>
<dd><p>This error is thrown when the transaction contains unsupported Stellar operation(s).</p>
</dd>
<dt><a href="#UnknownStellarTransactionEnvelopeTypeError">UnknownStellarTransactionEnvelopeTypeError</a> : <code>object</code></dt>
<dd><p>This error will be thrown when the transaction type is not supported.</p>
</dd>
<dt><a href="#ParseStellarTransactionFailedError">ParseStellarTransactionFailedError</a> : <code>object</code></dt>
<dd><p>This error is thrown when parsing the transaction fails.</p>
</dd>
<dt><a href="#UserRefusedOnDeviceError">UserRefusedOnDeviceError</a> : <code>object</code></dt>
<dd><p>This error is thrown when the user rejects the request.</p>
</dd>
</dl>

### Typedefs

<dl>
<dt><a href="#Signature">Signature</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#PublicKey">PublicKey</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AppConfiguration">AppConfiguration</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Stellar"></a>

### Stellar
Ledger Hardware Wallet Stellar JavaScript bindings.

**Kind**: global class

* [Stellar](#Stellar)
    * [new Stellar(transport, [scrambleKey])](#new_Stellar_new)
    * [.getPublicKey(accountIndex, [display])](#Stellar+getPublicKey) ⇒ [<code>PublicKey</code>](#PublicKey)
    * [.signTransaction(accountIndex, transaction)](#Stellar+signTransaction) ⇒ [<code>Signature</code>](#Signature)
    * [.signHash(accountIndex, hash)](#Stellar+signHash) ⇒ [<code>Signature</code>](#Signature)
    * [.getAppConfiguration()](#Stellar+getAppConfiguration) ⇒ [<code>AppConfiguration</code>](#AppConfiguration)

<a name="new_Stellar_new"></a>

#### new Stellar(transport, [scrambleKey])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| transport | <code>Transport</code> |  | The Ledger transport to use |
| [scrambleKey] | <code>string</code> | <code>&quot;w0w&quot;</code> | A string that will be used to scramble the device communication |

**Example**
```typescript
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import LedgerStellarApi from "ledger-stellar-sdk";

const transport = await TransportWebUSB.create();
const stellar = new LedgerStellarApi(transport);
```
<a name="Stellar+getPublicKey"></a>

#### stellar.getPublicKey(accountIndex, [display]) ⇒ [<code>PublicKey</code>](#PublicKey)
Get Stellar public key for a given account index.

**Kind**: instance method of [<code>Stellar</code>](#Stellar)
**Returns**: [<code>PublicKey</code>](#PublicKey) - an object with a publicKey and rawPublicKey.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accountIndex | <code>number</code> |  | It is part of key derivation path: `m/44'/148'/accountIndex'` |
| [display] | <code>boolean</code> | <code>false</code> | If set to "true", the public key will be displayed on the Ledger device and the user will be asked to confirm, otherwise it will not |

**Example**
```typescript
const response = stellar.getPublicKey(0, true)
```
<a name="Stellar+signTransaction"></a>

#### stellar.signTransaction(accountIndex, transaction) ⇒ [<code>Signature</code>](#Signature)
Sign the given transaction.

**Kind**: instance method of [<code>Stellar</code>](#Stellar)
**Returns**: [<code>Signature</code>](#Signature) - the signature

| Param | Type | Description |
| --- | --- | --- |
| accountIndex | <code>number</code> | It is part of key derivation path: `m/44'/148'/accountIndex'` |
| transaction | <code>Buffer</code> | The transaction to sign. It consists of network id and transaction envelope, if you are using `stellar-sdk`, you can use `transaction.signatureBase()` to get the value |

<a name="Stellar+signHash"></a>

#### stellar.signHash(accountIndex, hash) ⇒ [<code>Signature</code>](#Signature)
Sign the given hash.

It is intended for signing transactions not supported by the Ledger Stellar
app and should be avoided as much as possible.

**Kind**: instance method of [<code>Stellar</code>](#Stellar)
**Returns**: [<code>Signature</code>](#Signature) - the signature

| Param | Type | Description |
| --- | --- | --- |
| accountIndex | <code>number</code> | It is part of key derivation path: `m/44'/148'/accountIndex'` |
| hash | <code>string</code> \| <code>Buffer</code> | The hash to sign |

**Example**
```typescript
const response = stellar.signHash(0, "4b480b455a7ee154c33651819e3ce2ceb6bcd9dda78887777c4d2718c5cd04cd")
```
<a name="Stellar+getAppConfiguration"></a>

#### stellar.getAppConfiguration() ⇒ [<code>AppConfiguration</code>](#AppConfiguration)
Get the configuration of the Ledger Stellar app installed on the hardware device.

**Kind**: instance method of [<code>Stellar</code>](#Stellar)
**Returns**: [<code>AppConfiguration</code>](#AppConfiguration) - an object with the version and the flag to indicate whether hash signing is enabled
**Example**
```typescript
const response = await stellar.getAppConfiguration();
```
<a name="HashSigningModeNotEnabledError"></a>

### HashSigningModeNotEnabledError : <code>object</code>
This error is thrown when hash signing mode is not enabled.

**Kind**: global constant
<a name="UnknownStellarOperationTypeError"></a>

### UnknownStellarOperationTypeError : <code>object</code>
This error is thrown when the transaction contains unsupported Stellar operation(s).

**Kind**: global constant
<a name="UnknownStellarTransactionEnvelopeTypeError"></a>

### UnknownStellarTransactionEnvelopeTypeError : <code>object</code>
This error will be thrown when the transaction type is not supported.

**Kind**: global constant
<a name="ParseStellarTransactionFailedError"></a>

### ParseStellarTransactionFailedError : <code>object</code>
This error is thrown when parsing the transaction fails.

**Kind**: global constant
<a name="UserRefusedOnDeviceError"></a>

### UserRefusedOnDeviceError : <code>object</code>
This error is thrown when the user rejects the request.

**Kind**: global constant
<a name="Signature"></a>

### Signature : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| signature | <code>Buffer</code> | The signature |

<a name="PublicKey"></a>

### PublicKey : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| publicKey | <code>string</code> | Encoded public key |
| rawPublicKey | <code>Buffer</code> | Raw public key |

<a name="AppConfiguration"></a>

### AppConfiguration : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The version of the Stellar app installed on the device |
| hashSigningEnabled | <code>boolean</code> | Whether hash signing is enabled |
