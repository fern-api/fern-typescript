import { WithBaseContextMixin, WithRequestWrapperContextMixin, WithTypeContextMixin } from "./mixins";

export interface RequestWrapperContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithRequestWrapperContextMixin {}
