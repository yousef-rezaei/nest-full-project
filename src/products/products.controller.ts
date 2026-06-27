import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpException,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import userGuard from 'src/users/dto/userGuard';
import { I18n, I18nContext } from 'nestjs-i18n';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProductForbiddenResponseDto } from './dto/forbidden.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** Create (auth) */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
    type: ProductForbiddenResponseDto,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: { user: userGuard },
    @I18n() i18n: I18nContext,
  ) {
    createProductDto.user = req.user;
    const data = await this.productsService.create(createProductDto);
    return { message: i18n.t('tr.products.created'), data };
  }

  /** Get all */
  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiOkResponse({ description: 'List fetched successfully.' })
  async findAll(@I18n() i18n: I18nContext) {
    const data = await this.productsService.findAll();
    return { message: i18n.t('tr.products.list'), data };
  }

  /** Get by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get one product by ID' })
  @ApiParam({ name: 'id', type: Number, example: 123 })
  @ApiOkResponse({ description: 'Product found.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @I18n() i18n: I18nContext,
  ) {
    const data = await this.productsService.findOne(id);
    if (!data) throw new HttpException(i18n.t('tr.products.notFound'), 404);
    return { message: i18n.t('tr.products.detail'), data };
  }

  /** Update (auth) */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', type: Number, example: 123 })
  @ApiOkResponse({ description: 'The record has been successfully updated.' })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: { user: userGuard },
    @I18n() i18n: I18nContext,
  ) {
    updateProductDto.user = req.user;
    const data = await this.productsService.update(id, updateProductDto);
    return { message: i18n.t('tr.products.updated'), data };
  }

  /** Delete (auth) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', type: Number, example: 123 })
  @ApiOkResponse({ description: 'The record has been successfully deleted.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: userGuard },
    @I18n() i18n: I18nContext,
  ) {
    await this.productsService.remove(id, req.user);
    return { message: i18n.t('tr.products.deleted') };
  }
}
