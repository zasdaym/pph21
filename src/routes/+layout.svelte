<script lang="ts">
    import { dev } from "$app/environment";
    import {
        PUBLIC_ANALYTICS_ID,
        PUBLIC_ANALYTICS_URL,
    } from "$env/static/public";
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css"
    />
    {#if !dev}
        <script
            async
            src={PUBLIC_ANALYTICS_URL}
            data-website-id={PUBLIC_ANALYTICS_ID}
        ></script>
    {/if}
</svelte:head>
<slot />
