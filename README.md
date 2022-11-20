# JavaScript Ledger Stellar SDK

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

- [JavaScript Ledger Stellar SDK](#javascript-ledger-stellar-sdk)
  - [Installation](#installation)
  - [API Documentation](#api-documentation)
    - [Classes](#classes)
    - [Typedefs](#typedefs)
    - [Stellar](#stellar)
      - [new Stellar(transport, [scrambleKey])](#new-stellartransport-scramblekey)
      - [stellar.getPublicKey(accountIndex, [display]) ⇒ <code>PublicKey</code>](#stellargetpublickeyaccountindex-display--publickey)
      - [stellar.signTransaction(accountIndex, transaction) ⇒ <code>Signature</code>](#stellarsigntransactionaccountindex-transaction--signature)
      - [stellar.signHash(accountIndex, hash) ⇒ <code>Signature</code>](#stellarsignhashaccountindex-hash--signature)
      - [stellar.getAppConfiguration() ⇒ <code>AppConfiguration</code>](#stellargetappconfiguration--appconfiguration)
    - [Signature : <code>object</code>](#signature--object)
    - [PublicKey : <code>object</code>](#publickey--object)
    - [AppConfiguration : <code>object</code>](#appconfiguration--object)

<a name="new_Stellar_new"></a>

#### new Stellar(transport, [scrambleKey])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| transport | <code>Transport</code> |  | The Ledger transport to use |
| [scrambleKey] | <code>string</code> | <code>&quot;w0w&quot;</code> | A string that will be used to scramble the device communication |

**Example**
```typescript
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import LedgerStellarApi from "@ledgerhq/hw-app-stellar";

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
