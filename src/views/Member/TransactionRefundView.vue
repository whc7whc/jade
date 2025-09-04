<template>
  <div class="transaction-refund">
    <h1>交易退款申請</h1>
    <form @submit.prevent="submitRefund">
      <label for="transactionId">交易編號:</label>
      <input type="text" id="transactionId" v-model="transactionId" required />

      <label for="reason">退款原因:</label>
      <textarea id="reason" v-model="reason" required></textarea>

      <button type="submit">送出申請</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "TransactionRefundView",
  data() {
    return {
      transactionId: "",
      reason: ""
    };
  },
  methods: {
    submitRefund() {
      alert(`已提交退款申請\n交易編號: ${this.transactionId}\n原因: ${this.reason}`);
      this.transactionId = "";
      this.reason = "";
    }
  }
};
</script>

<style scoped>
.transaction-refund {
  padding: 20px;
  max-width: 400px;
}
label {
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
}
input, textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  margin-top: 15px;
}
</style>
