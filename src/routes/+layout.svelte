<script lang="ts">
    import { dev } from "$app/environment";
    import {
        PUBLIC_ANALYTICS_ID,
        PUBLIC_ANALYTICS_URL,
    } from "$env/static/public";
    import "../app.scss";
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
