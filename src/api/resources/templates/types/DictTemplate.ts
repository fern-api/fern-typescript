/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernInternal from "../../..";

export interface DictTemplate {
    imports?: string[];
    /**
     * We might not need this, but the idea here is to be able to omit if it's optional and undefined,
     * or default if omitted and required.
     */
    isOptional: boolean;
    /** Commonly the braces of a container like `{ $FERN_INPUT }`, but may even be something like `new Dict( $FERN_INPUT )` */
    containerTemplateString: string;
    delimiter: string;
    keyTemplate: FernInternal.Template;
    valueTemplate: FernInternal.Template;
    keyValueSeparator: string;
    templateInput?: FernInternal.PayloadInput;
}
