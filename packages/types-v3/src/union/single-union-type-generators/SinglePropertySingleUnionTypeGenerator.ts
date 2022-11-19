import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export class SinglePropertySingleUnionTypeGenerator implements SingleUnionTypeGenerator {
    private singleProperty: SingleUnionTypeProperty;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ singleProperty }: { singleProperty: SingleUnionTypeProperty }) {
        this.singleProperty = singleProperty;
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(file: SdkFile): OptionalKind<PropertySignatureStructure>[] {
        const type = file.getReferenceToType(this.singleProperty.type);
        return [
            {
                name: this.getSinglePropertyKey(),
                type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
                hasQuestionToken: type.isOptional,
            },
        ];
    }

    public getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[] {
        const type = file.getReferenceToType(this.singleProperty.type);
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                type.isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode
            ),
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                this.getSinglePropertyKey(),
                ts.factory.createIdentifier(SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined {
        return file.getReferenceToType(this.singleProperty.type).typeNode;
    }

    public getVisitorArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(localReferenceToUnionValue, this.getSinglePropertyKey())];
    }

    private getSinglePropertyKey(): string {
        return this.singleProperty.name.camelCase;
    }
}
