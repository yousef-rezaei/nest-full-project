import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// All fields become optional; Swagger metadata & i18n validations are preserved.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
