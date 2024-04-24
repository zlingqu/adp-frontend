<template>
  <div class="adp-homepage">
    <img src="@/assets/images/homepage.jpg" alt="" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';
import EnvironmentService from '@/service/environment';

const environmentService = EnvironmentService.getEnvironmentService();

@Component({
  components: {},
})
export default class AdHomepage extends Vue {}
</script>

<style lang="scss">
.adp-homepage img {
  width: 100%;
}
</style>
