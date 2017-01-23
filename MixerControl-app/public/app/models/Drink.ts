

import * as models from './models';

export interface Drink {
  id?: string;

  title?: string;

  description?: string;

  /**
   * The Thumbnail jpg in base64
   */
  thumbnail?: string;

  /**
   * The reference to the image
   */
  imageRef?: string;

  authorId?: string;

  createdAt?: Date;

  updatedAt?: Date;

  rating?: models.Rating;

  retailPrice?: models.Price;

}
