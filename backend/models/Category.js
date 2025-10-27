import mongoose from 'mongoose'

const categoriaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: String,
    parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
});


export const Categoria = mongoose.model('Categoria', categoriaSchema);