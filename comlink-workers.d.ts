
      declare module "comlink:@utils/search" {
        const mod: () => import("comlink").Remote<typeof import("./src/utils/search")>
        export default mod
      }