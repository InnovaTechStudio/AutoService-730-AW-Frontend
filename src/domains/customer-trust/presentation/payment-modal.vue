<template>

  <Dialog
      :visible="visible"
      modal
      :style="{ width: '500px' }"
      header="Proceso de Pago"
      class="payment-dialog"
      @update:visible="$emit('update:visible', false)"
  >

    <div class="payment-container">

      <!-- TOTAL -->
      <div class="payment-total">
        <span>Total a pagar</span>
        <h2>${{ amount }}</h2>
      </div>

      <!-- METHODS -->
      <div class="methods-grid">

        <div
            class="method-card"
            :class="{ active: selectedMethod === 'Yape' }"
            @click="selectedMethod = 'Yape'"
        >
          <img src="https://img.logo.dev/name/Yape?token=pk_N7BjeKbxQY2n_ta1Keni5Q&retina=true" alt="Yape"/>          <span>Yape</span>
        </div>

        <div
            class="method-card"
            :class="{ active: selectedMethod === 'Plin' }"
            @click="selectedMethod = 'Plin'"
        >
          <img
              src="https://thf.bing.com/th/id/OIP.CE4sOegvUrcoWtMDwQfGDQHaHa?w=179&h=180&c=7&r=0&o=7&cb=thfc1&pid=1.7&rm=3" alt="BCP"/>
          <span>Plin</span>
        </div>

        <div
            class="method-card"
            :class="{ active: selectedMethod === 'Tarjeta' }"
            @click="selectedMethod = 'Tarjeta'"
        >
          <img src="https://img.logo.dev/name/Bcp?token=pk_N7BjeKbxQY2n_ta1Keni5Q&retina=true" alt="Plin" />

          <span>Tarjeta</span>
        </div>

        <div
            class="method-card"
            :class="{ active: selectedMethod === 'Efectivo' }"
            @click="selectedMethod = 'Efectivo'"
        >
          <i class="pi pi-money-bill"></i>
          <span>Efectivo</span>
        </div>

      </div>

      <!-- CARD FORM -->
      <div
          v-if="selectedMethod === 'Tarjeta'"
          class="card-form"
      >

        <div class="form-group">
          <label>Número de tarjeta</label>
          <InputText placeholder="1234 5678 9012 3456" />
        </div>

        <div class="row">
          <div class="form-group">
            <label>Fecha</label>
            <InputText placeholder="MM/YY" />
          </div>

          <div class="form-group">
            <label>CVV</label>
            <InputText placeholder="123" />
          </div>
        </div>

      </div>

      <!-- QR -->
      <div
          v-if="selectedMethod === 'Yape' || selectedMethod === 'Plin'"
          class="qr-box"
      >
        <i class="pi pi-qrcode"></i>
        <p>Escanea el QR para pagar</p>
      </div>

      <!-- ACTION -->
      <Button
          label="Confirmar Pago"
          icon="pi pi-check"
          class="pay-btn"
          @click="processPayment"
      />

    </div>

  </Dialog>

</template>

<script setup>

import { ref } from 'vue';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const props = defineProps({
  visible: Boolean,
  amount: Number
});

const emit = defineEmits([
  'update:visible',
  'success'
]);

const selectedMethod = ref('Tarjeta');

const processPayment = () => {

  alert(`Pago realizado con ${selectedMethod.value}`);

  emit('success');

  emit('update:visible', false);
};

</script>

<style scoped>

.payment-container{
  display:flex;
  flex-direction:column;
  gap:1.5rem;
}

.payment-total{
  text-align:center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color:white;
  padding:1.5rem;
  border-radius:18px;
}

.payment-total span{
  opacity:0.8;
}

.payment-total h2{
  margin:0.5rem 0 0;
  font-size:2.3rem;
}

.methods-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:1rem;
}

.method-card{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  min-height:140px;
}

.method-card:hover{
  transform:translateY(-2px);
}

.method-card.active{
  border-color:#2563eb;
  background:#eff6ff;
}

.method-card img{
  width:60px;
  height:60px;
  object-fit:contain;
  margin-bottom:0.7rem;
}

.card-form{
  display:flex;
  flex-direction:column;
  gap:1rem;
}

.form-group{
  display:flex;
  flex-direction:column;
  gap:0.5rem;
}

.row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:1rem;
}

.qr-box{
  height:180px;
  border:2px dashed #cbd5e1;
  border-radius:18px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  gap:1rem;
  color:#64748b;
}

.qr-box i{
  font-size:4rem;
}

.pay-btn{
  width:100%;
  padding:1rem;
}

</style>