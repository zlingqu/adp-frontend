import Vue from 'vue';

export default Vue => {
  Vue.directive('focus', {
    inserted: function(el) {
      const dom = (el as any).querySelector('input') || (el as any).querySelector('textarea');
      dom.focus();
    },
  });
};
