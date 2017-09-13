

import * as models from './models';

export class Drink {
  id?: string;

  title?: string;

  description?: string;


  authorId?: string;

  licensefee?: number;
  retailPrice?: number;

  imageref?: string;

  productId?: string;

  program?: string;

  components?: models.Component[] = [];

}
