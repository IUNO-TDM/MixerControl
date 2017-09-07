

import * as models from './models';

export class Drink {
  id?: string;

  title?: string;

  description?: string;


  authorId?: string;

  licencefee?: number;
  retailprice?: number;

  imageref?: string;

  productId?: string;

  program?: string;

  components?: models.Component[] = [];

}
