const asyncHandler = require('express-async-handler');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new AppError(`No document for this id ${id}`, 404));
    }

    res
      .status(204)
      .json({ ststus: 'Success', msg: 'Document deleted successfully' });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new AppError(`No document for this id ${req.params.id}`, 404),
      );
    }
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new AppError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.params.departmentId)
      filter = { department: req.params.departmentId };

    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { query, paginationResult } = apiFeatures;
    const documents = await query;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.deleteAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.params.departmentId)
      filter = { department: req.params.departmentId };
    if (req.query.role) filter.role = req.query.role;

    // Build query
    const apiFeatures = new ApiFeatures(Model.deleteMany(filter), req.query);
    const { query } = apiFeatures;
    const deletedDocuments = await query;

    res.status(200).json({
      msg: 'Successfully deleted',
      deletedCount: deletedDocuments.deletedCount,
    });
  });
