
import User from '../models/user.models.js';
import vaultModels from '../models/vault.models.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'


const createVault = asyncHandler(async (req, res) => {

    const {title, content} = req.body;

    if ([title, content].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const vault = await vaultModels.create({
        title: title,
        content: content,
        owner: req.user.userId,
    });

    return res.status(201).json(
        new ApiResponse(201, vault, "Vault created successfully")
    );

});

const getVaults = asyncHandler(async (req, res) => {
    const vaults = await vaultModels.find({ owner: req.user.userId });
    return res.status(200).json(
        new ApiResponse(200, vaults, "Vaults retrieved successfully")
    );
});

const updateVault = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const vault = await vaultModels.findOne({ _id: id, owner: req.user.userId });

    if (!vault) {
        throw new ApiError(404, "Vault not found");
    }

    vault.title = title || vault.title;
    vault.content = content || vault.content;

    await vault.save();

    return res.status(200).json(
        new ApiResponse(200, vault, "Vault updated successfully")
    );
});

const deleteVault = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const vault = await vaultModels.findOne({ _id: id, owner: req.user.userId });

    if (!vault) {
        throw new ApiError(404, "Vault not found");
    }

    await vault.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Vault deleted successfully")
    );
});


const getVault = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const vault = await vaultModels.findOne({ _id: id, owner: req.user.userId });

    if (!vault) {
        throw new ApiError(404, "Vault not found");
    }

    return res.status(200).json(
        new ApiResponse(200, vault, "Vault retrieved successfully")
    );
});

export { createVault, getVaults,getVault, updateVault, deleteVault };