<script lang="ts">
    import "../app.scss";
    import { dev } from "$app/environment";
    import {
        PUBLIC_ANALYTICS_ID,
        PUBLIC_ANALYTICS_URL,
    } from "$env/static/public";
</script>

<svelte:head>
    {#if !dev}
        <script
            async
            src={PUBLIC_ANALYTICS_URL}
            data-website-id={PUBLIC_ANALYTICS_ID}
        ></script>
    {/if}
</svelte:head>
<slot />
