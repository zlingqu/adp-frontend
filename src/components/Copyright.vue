<template>
  <div class="adp-copyright">©️{{ currentYear }} 暗物智能（广州）科技有限公司</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';

@Component({
  components: {},
})
export default class AdpNav extends Vue {
  currentYear: string = moment(new Date()).format('YYYY');
}
</script>
