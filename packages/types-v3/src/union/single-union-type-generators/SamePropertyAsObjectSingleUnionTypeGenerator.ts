import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export class SamePropertyAsObjectSingleUnionTypeGenerator implements SingleUnionTypeGenerator {
    private extended: DeclaredTypeName;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ extended }: { extended: DeclaredTypeName }) {
        this.extended = extended;
    }

    public getExtendsForInterface(file: SdkFile): ts.TypeNode[] {
        return [file.getReferenceToNamedType(this.extended).getTypeNode()];
    }

    public getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    public getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[] {
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                SamePropertyAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                file.getReferenceToNamedType(this.extended).getTypeNode()
            ),
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createSpreadAssignment(
                ts.factory.createIdentifier(SamePropertyAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined {
        return file.getReferenceToNamedType(this.extended).getTypeNode();
    }

    public getVisitorArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [localReferenceToUnionValue];
    }
}
