<script lang="ts">
  import { dev } from "$app/environment";
  import {
    PUBLIC_ANALYTICS_URL,
    PUBLIC_ANALYTICS_ID,
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

<main>
  <slot />
</main>
