import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { EnvironmentsContext } from "@fern-typescript/contexts";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { EnvironmentEnumDeclarationReferencer } from "../declaration-referencers/EnvironmentEnumDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EnvironmentsContextMixinImpl } from "./mixins/EnvironmentsContextMixinImpl";

export declare namespace EnvironmentsContextImpl {
    export interface Init extends BaseContextImpl.Init {
        intermediateRepresentation: IntermediateRepresentation;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsEnumDeclarationReferencer: EnvironmentEnumDeclarationReferencer;
    }
}

export class EnvironmentsContextImpl extends BaseContextImpl implements EnvironmentsContext {
    public readonly environments: EnvironmentsContextMixinImpl;

    constructor({
        intermediateRepresentation,
        environmentsGenerator,
        environmentsEnumDeclarationReferencer,
        ...superInit
    }: EnvironmentsContextImpl.Init) {
        super(superInit);
        this.environments = new EnvironmentsContextMixinImpl({
            intermediateRepresentation,
            environmentsGenerator,
            environmentsEnumDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
