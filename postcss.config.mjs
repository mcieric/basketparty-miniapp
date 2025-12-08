/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        '@tailwindcss/postcss': {
            config: './tailwind.config.ts',
        },
        autoprefixer: {},
    },
};

export default config;
