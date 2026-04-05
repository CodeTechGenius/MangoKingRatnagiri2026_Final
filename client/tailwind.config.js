/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        gold:   { DEFAULT:'#C8922A', lt:'#E5B858', dk:'#956A18', faint:'#FBF4E6' },
        cream:  { DEFAULT:'#FBF8F2', dk:'#F2EBD9', dkr:'#E6D9C0' },
        brown:  { DEFAULT:'#1E0F06', md:'#3D1F0E', lt:'#7A5020' },
        forest: { DEFAULT:'#173422', lt:'#255C38', faint:'#EFF7F2' },
        muted:  '#8B7355',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '2xl': '20px', '3xl': '28px', '4xl': '36px' },
      transitionDuration: { 350: '350ms', 400: '400ms' },
    },
  },
  plugins: [],
};
