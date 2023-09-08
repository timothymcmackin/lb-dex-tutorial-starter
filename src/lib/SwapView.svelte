<script lang="ts">
  import { onMount } from "svelte";
  import UserInput from "./UserInput.svelte";
  import { type token, TxStatus } from "../types";
  import {
    xtzToTokenTokenOutput,
    tokenToXtzXtzOutput,
    calcSlippageValue
  } from "../lbUtils";
  import store from "../store";
  import { displayTokenAmount, fetchBalances, calcDeadline } from "../utils";
  import { dexAddress, tzbtcAddress, XTZ, tzBTC } from "../config";

  let tokenFrom: token = "XTZ";
  let tokenTo: token = "tzBTC";
  let inputFrom = "";
  let inputTo = "";
  let minimumOutput = 0;
  let xtzToTzbtc = 0;
  let tzbtcToXtz = 0;
  let slippage: "0.1" | "0.5" | "1" = "0.1";
  let insufficientBalance = false;
  let resetInputs = false;
  let swapStatus = TxStatus.NoTransaction;

  const refreshMinimumOutput = () => {
    saveInput({
      detail: {
        token: tokenFrom,
        val: +inputFrom,
        insufficientBalance: false
      }
    });
  };

  const switchTokens = () => {
    resetInputs = true;
    setTimeout(() => (resetInputs = false), 100);

    if (tokenFrom === "XTZ") {
      tokenFrom = "tzBTC";
      tokenTo = "XTZ";
      // switches the values
      if (inputFrom && inputTo) {
        const tmpInputTo = inputTo;
        inputTo = inputFrom;
        inputFrom = tmpInputTo;
      }
    } else {
      tokenFrom = "XTZ";
      tokenTo = "tzBTC";
      // switches the values
      if (inputFrom && inputTo) {
        const tmpInputTo = inputTo;
        inputTo = inputFrom;
        inputFrom = tmpInputTo;
      }
    }
  };

  const saveInput = ev => {
    const { token, val, insufficientBalance: insufBlnc } = ev.detail;
    insufficientBalance = insufBlnc;

    if (token === tokenFrom && val !== null && val > 0 && isFinite(val)) {
      inputFrom = val.toString();
      inputTo = "";
      if (tokenFrom === "XTZ") {
        // calculates tzBTC amount
        let tzbtcAmount = xtzToTokenTokenOutput({
          xtzIn: val * 10 ** XTZ.decimals,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (tzbtcAmount) {
          inputTo = tzbtcAmount.dividedBy(10 ** tzBTC.decimals).toPrecision(6);
        }
        // calculates minimum output
        minimumOutput = calcSlippageValue("tzBTC", +inputTo, +slippage);
      } else if (
        tokenFrom === "tzBTC" &&
        val !== null &&
        val > 0 &&
        isFinite(val)
      ) {
        // calculates XTZ amount
        let xtzAmount = tokenToXtzXtzOutput({
          tokenIn: val * 10 ** tzBTC.decimals,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (xtzAmount) {
          inputTo = xtzAmount.dividedBy(10 ** XTZ.decimals).toPrecision(8);
        }
        // calculates minimum output
        minimumOutput = calcSlippageValue("XTZ", +inputTo, +slippage);
      }
    } else {
      insufficientBalance = true;
      inputFrom = "";
      inputTo = "";
    }
  };

  const swap = async () => {
    try {

      // TUTORIAL TODO

    } catch (error) {
      console.log(error);
      swapStatus = TxStatus.Error;
      store.updateToast(true, "An error has occurred");
    } finally {
      setTimeout(() => {
        swapStatus = TxStatus.NoTransaction;
        store.showToast(false);
      }, 3000);
    }
  };

  onMount(() => {
    let tzbtcAmount = xtzToTokenTokenOutput({
      xtzIn: 10 ** XTZ.decimals,
      xtzPool: $store.dexInfo.xtzPool,
      tokenPool: $store.dexInfo.tokenPool
    });
    if (tzbtcAmount) {
      xtzToTzbtc = tzbtcAmount.toNumber();
    }

    let xtzAmount = tokenToXtzXtzOutput({
      tokenIn: 10 ** tzBTC.decimals,
      xtzPool: $store.dexInfo.xtzPool,
      tokenPool: $store.dexInfo.tokenPool
    });
    if (xtzAmount) {
      tzbtcToXtz = xtzAmount.toNumber();
    }
  });
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .swap-container {
    .swap-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .token-selector {
      cursor: pointer;
      border: solid 2px transparent;
      border-radius: 50%;
      padding: 10px;
      transition: 0.3s;

      &:hover {
        border-color: $powder-blue;
        transform: rotate(180deg);
      }
    }
  }
</style>

<div class="container swap-container">
  <h1>Swap</h1>
  <div class="swap-inputs">
    <UserInput
      token={tokenFrom}
      inputVal={inputFrom}
      logoPos="left"
      on:new-input={saveInput}
      disabled={false}
      reset={resetInputs}
    />
    <button class="transparent" on:click={switchTokens}>
      <img class="token-selector" src="images/repeat.svg" alt="switch" />
    </button>
    <UserInput
      token={tokenTo}
      inputVal={inputTo}
      logoPos="right"
      on:new-input={saveInput}
      disabled={true}
      reset={resetInputs}
    />
  </div>
  <div>
    Slippage:
    <span>
      <input
        type="radio"
        name="slippage"
        bind:group={slippage}
        value="0.1"
        on:change={refreshMinimumOutput}
      />
      0.1%
    </span>
    <span>
      <input
        type="radio"
        name="slippage"
        bind:group={slippage}
        value="0.5"
        on:change={refreshMinimumOutput}
      />
      0.5%
    </span>
    <span>
      <input
        type="radio"
        name="slippage"
        bind:group={slippage}
        value="1"
        on:change={refreshMinimumOutput}
      />
      1%
    </span>
  </div>
  <div>
    {#if tokenFrom === "XTZ"}
      Price rate: 1 XTZ = {displayTokenAmount(xtzToTzbtc, "tzBTC")} tzBTC
    {:else}
      Price rate: 1 tzBTC = {displayTokenAmount(tzbtcToXtz, "XTZ")} XTZ
    {/if}
  </div>
  <div>
    Minimum received:
    {#if minimumOutput && tokenTo === "tzBTC"}
      {minimumOutput / 10 ** 8} tzBTC
    {:else if minimumOutput && tokenTo === "XTZ"}
      {minimumOutput / 10 ** 6} XTZ
    {:else}
      <span>---</span>
    {/if}
  </div>
  <button
    class="primary"
    disabled={!inputFrom ||
      !inputTo ||
      !$store.userAddress ||
      insufficientBalance}
    on:click={swap}
  >
    {#if swapStatus === TxStatus.Loading}
      <div class="spinner">
        <div />
        <div />
        <div />
        <div />
      </div>
      <span> Swapping </span>
    {:else}
      Swap
    {/if}
  </button>
</div>
